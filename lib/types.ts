export type RatingLevel = 'vies' | 'eetbaar' | 'lekker' | 'heerlijk';

// Cheese detection (Gemini) — types shared between app and Cloud Function
export interface DetectCheeseRequest {
  imageBase64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface DetectedCheese {
  name: string | null;
  texture: 'vers' | 'zacht' | 'halfzacht' | 'halfhard' | 'hard' | null;
  milkType: 'koe' | 'geit' | 'schaap' | 'buffel' | 'gemengd' | null;
  origin: string | null;
  confidence: 'hoog' | 'laag';
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
  texture: 'vers' | 'zacht' | 'halfzacht' | 'halfhard' | 'hard';
  milkType: 'koe' | 'geit' | 'schaap' | 'buffel' | 'gemengd';
  origin: string;
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
