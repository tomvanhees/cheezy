import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  TEXTURES,
  MILK_TYPES,
  CHEESE_FAMILIES,
  AGING_PERIODS,
  ORIGINS,
} from './cheeseData';
import type { OptionCategory } from './types';

// Seeded values per category (lowercase for comparison)
const SEEDS: Record<OptionCategory, string[]> = {
  textures: TEXTURES.map((t) => t.value),
  milkTypes: MILK_TYPES.map((m) => m.value),
  cheeseFamilies: CHEESE_FAMILIES.map((f) => f.value),
  agingPeriods: AGING_PERIODS.map((a) => a.value),
  extraOrigins: ORIGINS.flatMap((o) => [
    o.country,
    ...o.regions.map((r) => `${o.country} — ${r}`),
  ]),
  storeLocations: [], // no seeds; all stores are user-created
};

function optionsRef(category: OptionCategory) {
  return doc(db, '_options', category);
}

/** Fetch custom (non-seeded) values stored in Firestore for a category. */
export async function getCustomOptions(category: OptionCategory): Promise<string[]> {
  const snap = await getDoc(optionsRef(category));
  if (!snap.exists()) return [];
  return (snap.data().values as string[]) ?? [];
}

// Preserve display labels for categories where value ≠ label (e.g. agingPeriods)
const SEED_LABEL_MAPS: Partial<Record<OptionCategory, Map<string, string>>> = {
  agingPeriods: new Map(AGING_PERIODS.map((a) => [a.value, a.label])),
};

/**
 * Merge seeded values with any custom additions from Firestore.
 * Returns an array of { value, label } objects ready for ChipPicker.
 * Custom values are appended after the seeds.
 */
export async function getMergedOptions(
  category: OptionCategory
): Promise<{ value: string; label: string }[]> {
  const labelMap = SEED_LABEL_MAPS[category];
  const seeds = SEEDS[category].map((v) => ({ value: v, label: labelMap?.get(v) ?? v }));
  const custom = await getCustomOptions(category);
  const seedSet = new Set(SEEDS[category].map((v) => v.toLowerCase()));
  const newOnes = custom
    .filter((v) => !seedSet.has(v.toLowerCase()))
    .map((v) => ({ value: v, label: v }));
  return [...seeds, ...newOnes];
}

/**
 * If `value` is not already in the seeded list for this category,
 * persist it to Firestore so it becomes available as a chip option.
 * Safe to call multiple times — uses arrayUnion.
 */
export async function saveIfNew(category: OptionCategory, value: string): Promise<void> {
  if (!value?.trim()) return;
  const trimmed = value.trim();
  const inSeeds = SEEDS[category].some(
    (s) => s.toLowerCase() === trimmed.toLowerCase()
  );
  if (inSeeds) return;

  const ref = optionsRef(category);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { values: arrayUnion(trimmed), updatedAt: Date.now() });
  } else {
    await setDoc(ref, { values: [trimmed], updatedAt: Date.now() });
  }
}

/**
 * Given a DetectedCheese result, persist any values that are new
 * to the relevant option categories.
 */
export async function persistDetectedOptions(detected: {
  texture?: string | null;
  milkType?: string | null;
  cheeseFamily?: string | null;
  agingPeriod?: string | null;
  origin?: string | null;
}): Promise<void> {
  const tasks: Promise<void>[] = [];
  if (detected.texture) tasks.push(saveIfNew('textures', detected.texture));
  if (detected.milkType) tasks.push(saveIfNew('milkTypes', detected.milkType));
  if (detected.cheeseFamily) tasks.push(saveIfNew('cheeseFamilies', detected.cheeseFamily));
  if (detected.agingPeriod) tasks.push(saveIfNew('agingPeriods', detected.agingPeriod));
  if (detected.origin) tasks.push(saveIfNew('extraOrigins', detected.origin));
  await Promise.all(tasks);
}
