export type RatingLevel = 'vies' | 'eetbaar' | 'lekker' | 'heerlijk';

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
