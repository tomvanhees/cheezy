export type RatingLevel = 'vies' | 'eetbaar' | 'lekker' | 'heerlijk';

// Cheese detection (Gemini) — types shared between app and Cloud Function
export interface DetectCheeseRequest {
  imageBase64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface DetectedCheese {
  name: string | null;
  texture: string | null;
  milkType: string | null;
  origin: string | null;
  cheeseFamily: string | null;
  agingPeriod: string | null;
  producer: string | null;
  confidence: 'hoog' | 'laag';
}

// Firestore document structure for dynamic options
export type OptionCategory =
  | 'textures'
  | 'milkTypes'
  | 'cheeseFamilies'
  | 'agingPeriods'
  | 'extraOrigins'
  | 'storeLocations';

export interface OptionsDoc {
  values: string[];
  updatedAt: number;
}

export interface AppUser {
  id: string;
  name: string;
  color: string;
  expoPushToken?: string;
  createdAt: number;
}

export interface Cheese {
  id: string;
  name: string;
  texture: string;       // 'vers' | 'zacht' | 'halfzacht' | 'halfhard' | 'hard' + custom
  milkType: string;      // 'koe' | 'geit' | 'schaap' | 'buffel' | 'gemengd' + custom
  origin: string;
  cheeseFamily?: string; // e.g. 'Blauwschimmelkaas', 'Gewassenkorstkaas' (optional for backward compat)
  agingPeriod?: string;  // e.g. 'Jong', 'Belegen', 'Extra oud' (optional for backward compat)
  producer?: string;     // brand / producer name (optional for backward compat)
  imageUrl?: string;
  purchaseLocations: string[];
  createdAt: number;
  createdBy: string;
  _schemaVersion: number;
}

export interface Rating {
  userId: string;
  cheeseId: string;
  rating: RatingLevel;
  note?: string;
  ratedAt: number;
  _schemaVersion: number;
}
