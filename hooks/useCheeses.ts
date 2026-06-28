import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  subscribeToCheeses,
  subscribeToAllRatings,
  addCheese,
  updateCheese,
  deleteCheese,
  setRating,
} from '@/lib/firestore';
import { compressAndUploadImage, deleteCheeseImage } from '@/lib/storage';
import type { Cheese, Rating, RatingLevel } from '@/lib/types';

// ── Cheeses list ─────────────────────────────────────────────────────────────

export function useCheeses() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsub = subscribeToCheeses((cheeses) => {
      queryClient.setQueryData<Cheese[]>(['cheeses'], cheeses);
    });
    return unsub;
  }, [queryClient]);

  return useQuery<Cheese[]>({
    queryKey: ['cheeses'],
    queryFn: () => [],
    staleTime: Infinity,
  });
}

// ── All ratings (for list view) ───────────────────────────────────────────────

export function useAllRatings(cheeseIds: string[]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (cheeseIds.length === 0) return;
    const unsub = subscribeToAllRatings(cheeseIds, (ratingsMap) => {
      queryClient.setQueryData<Record<string, Rating[]>>(['ratings'], ratingsMap);
    });
    return unsub;
  }, [cheeseIds.join(','), queryClient]);

  return useQuery<Record<string, Rating[]>>({
    queryKey: ['ratings'],
    queryFn: () => ({}),
    staleTime: Infinity,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useAddCheese() {
  return useMutation({
    mutationFn: async ({
      data,
      imageUri,
    }: {
      data: Omit<Cheese, 'id' | 'createdAt' | '_schemaVersion'>;
      imageUri?: string;
    }) => {
      const id = await addCheese({ ...data });
      if (imageUri) {
        try {
          const imageUrl = await compressAndUploadImage(imageUri, id);
          await updateCheese(id, { imageUrl });
          return { id, imageUploadFailed: false };
        } catch {
          // Cheese was created successfully; image upload failed.
          // Return without throwing so the form navigates away and
          // the user can add a photo later (prevents double-creation).
          return { id, imageUploadFailed: true };
        }
      }
      return { id, imageUploadFailed: false };
    },
  });
}

export function useUpdateCheese() {
  return useMutation({
    mutationFn: async ({
      id,
      data,
      imageUri,
    }: {
      id: string;
      data: Partial<Omit<Cheese, 'id' | 'createdAt' | '_schemaVersion'>>;
      imageUri?: string;
    }) => {
      if (imageUri) {
        const imageUrl = await compressAndUploadImage(imageUri, id);
        await updateCheese(id, { ...data, imageUrl });
      } else {
        await updateCheese(id, data);
      }
    },
  });
}

export function useDeleteCheese() {
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteCheeseImage(id);
      await deleteCheese(id);
    },
  });
}

export function useSetRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cheeseId,
      userId,
      rating,
      note,
    }: {
      cheeseId: string;
      userId: string;
      rating: RatingLevel;
      note?: string;
    }) => setRating(cheeseId, userId, rating, note),
    // Optimistic update
    onMutate: async ({ cheeseId, userId, rating, note }) => {
      await queryClient.cancelQueries({ queryKey: ['ratings'] });
      const prev = queryClient.getQueryData<Record<string, Rating[]>>(['ratings']);
      queryClient.setQueryData<Record<string, Rating[]>>(['ratings'], (old = {}) => {
        const existing = (old[cheeseId] ?? []).filter((r) => r.userId !== userId);
        return {
          ...old,
          [cheeseId]: [
            ...existing,
            { userId, cheeseId, rating, note, ratedAt: Date.now(), _schemaVersion: 1 },
          ],
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['ratings'], ctx.prev);
    },
  });
}
