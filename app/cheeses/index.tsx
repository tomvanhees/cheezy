import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { useCheeses, useAllRatings } from '@/hooks/useCheeses';
import { subscribeToUsers } from '@/lib/firestore';
import { CheeseCard } from '@/components/CheeseCard';
import { Colors, Fonts, Radius, Shadow } from '@/lib/theme';
import { applySortAndFilter } from '@/lib/ranking';
import type { SortOption } from '@/lib/ranking';
import type { AppUser } from '@/lib/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'consensus', label: 'Beoordeling' },
  { value: 'naam', label: 'Naam A–Z' },
  { value: 'nieuwst', label: 'Nieuwst' },
  { value: 'textuur', label: 'Textuur' },
];

const TEXTURE_FILTERS = [
  { value: 'vers', label: 'Vers' },
  { value: 'zacht', label: 'Zacht' },
  { value: 'halfzacht', label: 'Halfzacht' },
  { value: 'halfhard', label: 'Halfhard' },
  { value: 'hard', label: 'Hard' },
];

const MILK_FILTERS = [
  { value: 'koe', label: '🐄 Koe' },
  { value: 'geit', label: '🐐 Geit' },
  { value: 'schaap', label: '🐑 Schaap' },
  { value: 'buffel', label: '🐃 Buffel' },
  { value: 'gemengd', label: '🥛 Gemengd' },
];

function useUsers() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = subscribeToUsers((users) => {
      queryClient.setQueryData<AppUser[]>(['users'], users);
    });
    return unsub;
  }, [queryClient]);
  return useQuery<AppUser[]>({ queryKey: ['users'], queryFn: () => [], staleTime: Infinity });
}

export default function CheeseListScreen() {
  const { user } = useUser();
  const { data: cheeses = [], isLoading } = useCheeses();
  const { data: users = [] } = useUsers();

  const cheeseIds = useMemo(() => cheeses.map((c) => c.id), [cheeses]);
  const { data: ratingsMap = {} } = useAllRatings(cheeseIds);

  const [sort, setSort] = useState<SortOption>('consensus');
  const [textureFilter, setTextureFilter] = useState<string[]>([]);
  const [milkFilter, setMilkFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const cheesesWithRatings = useMemo(
    () => cheeses.map((c) => ({ ...c, ratings: ratingsMap[c.id] ?? [] })),
    [cheeses, ratingsMap]
  );

  const sorted = useMemo(
    () =>
      applySortAndFilter(cheesesWithRatings, sort, {
        textures: textureFilter,
        milkTypes: milkFilter,
      }),
    [cheesesWithRatings, sort, textureFilter, milkFilter]
  );

  const activeFilterCount = textureFilter.length + milkFilter.length;

  const toggleFilter = (
    arr: string[],
    setArr: (v: string[]) => void,
    value: string
  ) => {
    setArr(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Onze Kazen 🧀',
          headerRight: () => (
            <Text style={styles.userLabel}>{user?.name ?? ''}</Text>
          ),
        }}
      />

      <View style={styles.container}>
        {/* Sort bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortBar}
        >
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.sortChip, sort === opt.value && styles.sortChipActive]}
              onPress={() => setSort(opt.value)}
            >
              <Text style={[styles.sortChipText, sort === opt.value && styles.sortChipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={[styles.sortChip, activeFilterCount > 0 && styles.sortChipActive]}
            onPress={() => setShowFilters((v) => !v)}
          >
            <Text style={[styles.sortChipText, activeFilterCount > 0 && styles.sortChipTextActive]}>
              {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
            </Text>
          </Pressable>
        </ScrollView>

        {/* Filter panel */}
        {showFilters && (
          <View style={styles.filterPanel}>
            <Text style={styles.filterLabel}>Textuur</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {TEXTURE_FILTERS.map((f) => (
                <Pressable
                  key={f.value}
                  style={[styles.filterChip, textureFilter.includes(f.value) && styles.filterChipActive]}
                  onPress={() => toggleFilter(textureFilter, setTextureFilter, f.value)}
                >
                  <Text style={[styles.filterChipText, textureFilter.includes(f.value) && styles.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Melksoort</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {MILK_FILTERS.map((f) => (
                <Pressable
                  key={f.value}
                  style={[styles.filterChip, milkFilter.includes(f.value) && styles.filterChipActive]}
                  onPress={() => toggleFilter(milkFilter, setMilkFilter, f.value)}
                >
                  <Text style={[styles.filterChipText, milkFilter.includes(f.value) && styles.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {activeFilterCount > 0 && (
              <Pressable
                style={styles.resetBtn}
                onPress={() => { setTextureFilter([]); setMilkFilter([]); }}
              >
                <Text style={styles.resetBtnText}>Filters wissen</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* List */}
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : sorted.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>🧀</Text>
            <Text style={styles.emptyTitle}>Nog geen kazen</Text>
            <Text style={styles.emptySubtitle}>Voeg je eerste kaas toe!</Text>
          </View>
        ) : (
          <FlatList
            data={sorted}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <CheeseCard
                cheese={item}
                ratings={item.ratings}
                users={users}
                onPress={() => router.push(`/cheeses/${item.id}`)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}

        {/* FAB */}
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/cheeses/new')}
          android_ripple={{ color: '#FFFFFF44', radius: 32 }}
        >
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  userLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  sortBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  sortChip: {
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  sortChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortChipText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sortChipTextActive: {
    color: '#FFFFFF',
  },
  filterPanel: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: `${Colors.primary}22`,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.primaryDark,
    fontFamily: Fonts.bodySemiBold,
  },
  resetBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  resetBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.rating.vies,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: Colors.text,
  },
  emptySubtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  fabIcon: {
    fontSize: 30,
    color: '#FFFFFF',
    lineHeight: 34,
  },
});
