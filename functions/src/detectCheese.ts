import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { defineSecret } from 'firebase-functions/params';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

interface DetectCheeseRequest {
  imageBase64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}

interface DetectedCheese {
  name: string | null;
  texture: 'vers' | 'zacht' | 'halfzacht' | 'halfhard' | 'hard' | null;
  milkType: 'koe' | 'geit' | 'schaap' | 'buffel' | 'gemengd' | null;
  origin: string | null;
  cheeseFamily: string | null;
  agingPeriod: string | null;
  producer: string | null;
  confidence: 'hoog' | 'laag';
}

const SYSTEM_PROMPT = `Je bent een kaasexpert. Analyseer de afbeelding en identificeer de kaas.

Geef een JSON-object terug (geen uitleg, alleen JSON) met:
- "name": de naam van de kaas (string) of null als je geen kaas ziet
- "texture": een van "vers", "zacht", "halfzacht", "halfhard", "hard", of null als onbekend
- "milkType": een van "koe", "geit", "schaap", "buffel", "gemengd", of null als onbekend
- "origin": land of regio van herkomst in het Nederlands (bijv. "Frankrijk — Normandie"), of null als onbekend
- "cheeseFamily": het kaastype in het Nederlands (bijv. "Blauwschimmelkaas", "Witschimmelkaas", "Harde kaas", "Gewassenkorstkaas"), of null als onbekend
- "agingPeriod": de rijpingstijd in het Nederlands (bijv. "Jong", "Belegen", "Oud", "Extra oud"), of null als onbekend
- "producer": de naam van de producent of het merk (bijv. "Beemster", "President"), of null als onbekend
- "confidence": "hoog" als je zeker bent, "laag" als je gokt

Als je geen kaas kunt herkennen, zet dan "name" op null.`;

const VALID_TEXTURES = new Set(['vers', 'zacht', 'halfzacht', 'halfhard', 'hard']);
const VALID_MILK_TYPES = new Set(['koe', 'geit', 'schaap', 'buffel', 'gemengd']);

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function sanitize(raw: unknown): DetectedCheese {
  if (typeof raw !== 'object' || raw === null) {
    return { name: null, texture: null, milkType: null, origin: null, cheeseFamily: null, agingPeriod: null, producer: null, confidence: 'laag' };
  }
  const r = raw as Record<string, unknown>;
  return {
    name: str(r.name),
    texture: VALID_TEXTURES.has(r.texture as string)
      ? (r.texture as DetectedCheese['texture'])
      : null,
    milkType: VALID_MILK_TYPES.has(r.milkType as string)
      ? (r.milkType as DetectedCheese['milkType'])
      : null,
    origin: str(r.origin),
    cheeseFamily: str(r.cheeseFamily),
    agingPeriod: str(r.agingPeriod),
    producer: str(r.producer),
    confidence: r.confidence === 'hoog' ? 'hoog' : 'laag',
  };
}

export const detectCheese = onCall(
  { secrets: [geminiApiKey], region: 'europe-west1' },
  async (request) => {
    const { imageBase64, mimeType } = request.data as DetectCheeseRequest;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      throw new HttpsError('invalid-argument', 'imageBase64 is vereist.');
    }
    if (imageBase64.length > 10_000_000) {
      throw new HttpsError('invalid-argument', 'Afbeelding is te groot (max 7.5 MB).');
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError('internal', 'Gemini API-sleutel ontbreekt.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      {
        inlineData: {
          mimeType: mimeType ?? 'image/jpeg',
          data: imageBase64,
        },
      },
    ]);

    const text = result.response.text().trim();

    // Strip markdown code fences if Gemini wraps the JSON
    const jsonText = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      // Gemini returned non-JSON — treat as undetected
      parsed = { name: null, confidence: 'laag' };
    }

    return sanitize(parsed);
  }
);
