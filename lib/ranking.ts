import type { Cheese, Rating, RatingLevel } from './types';

const SCORE: Record<RatingLevel, number> = {
  vies: 1,
  eetbaar: 2,
  lekker: 3,
  heerlijk: 4,
};

export interface CheeseWithRatings extends Cheese {
  ratings: Rating[];
}

/**
 * Consensus-based sort: cheeses where more users gave the highest rating rank first.
 * Tiebreaking cascades through each rating level, then alphabetically.
 */
export function sortByConcensus(cheeses: CheeseWithRatings[]): CheeseWithRatings[] {
  return [...cheeses].sort((a, b) => {
    // Cheeses with no ratings go to the bottom
    if (a.ratings.length === 0 && b.ratings.length === 0) {
      return a.name.localeCompare(b.name);
    }
    if (a.ratings.length === 0) return 1;
    if (b.ratings.length === 0) return -1;

    const levels: RatingLevel[] = ['heerlijk', 'lekker', 'eetbaar', 'vies'];
    for (const level of levels) {
      const countA = a.ratings.filter((r) => r.rating === level).length;
      const countB = b.ratings.filter((r) => r.rating === level).length;
      if (level === 'vies') {
        // Fewer 'vies' votes is better
        if (countA !== countB) return countA - countB;
      } else {
        if (countA !== countB) return countB - countA;
      }
    }
    return a.name.localeCompare(b.name);
  });
}

export function sortByName(cheeses: CheeseWithRatings[]): CheeseWithRatings[] {
  return [...cheeses].sort((a, b) => a.name.localeCompare(b.name));
}

export function sortByNewest(cheeses: CheeseWithRatings[]): CheeseWithRatings[] {
  return [...cheeses].sort((a, b) => b.createdAt - a.createdAt);
}

const TEXTURE_ORDER = ['vers', 'zacht', 'halfzacht', 'halfhard', 'hard'];
export function sortByTexture(cheeses: CheeseWithRatings[]): CheeseWithRatings[] {
  return [...cheeses].sort((a, b) => {
    const ia = TEXTURE_ORDER.indexOf(a.texture);
    const ib = TEXTURE_ORDER.indexOf(b.texture);
    if (ia !== ib) return ia - ib;
    return a.name.localeCompare(b.name);
  });
}

export type SortOption = 'consensus' | 'naam' | 'nieuwst' | 'textuur';

export function applySortAndFilter(
  cheeses: CheeseWithRatings[],
  sort: SortOption,
  filters: {
    textures: string[];
    milkTypes: string[];
    userId?: string;
  }
): CheeseWithRatings[] {
  let result = cheeses;

  if (filters.textures.length > 0) {
    result = result.filter((c) => filters.textures.includes(c.texture));
  }
  if (filters.milkTypes.length > 0) {
    result = result.filter((c) => filters.milkTypes.includes(c.milkType));
  }
  if (filters.userId) {
    result = result.filter((c) => c.ratings.some((r) => r.userId === filters.userId));
  }

  switch (sort) {
    case 'naam':
      return sortByName(result);
    case 'nieuwst':
      return sortByNewest(result);
    case 'textuur':
      return sortByTexture(result);
    default:
      return sortByConcensus(result);
  }
}

export function averageScore(ratings: Rating[]): number {
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, r) => sum + SCORE[r.rating], 0) / ratings.length;
}
