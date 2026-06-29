import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  SectionList,
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
import type { SortOption, CheeseWithRatings } from '@/lib/ranking';
import type { AppUser, RatingLevel } from '@/lib/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

type CheeseSection = { title: string; data: CheeseWithRatings[] };

const TEXTURE_ORDER = ['vers', 'zacht', 'halfzacht', 'halfhard', 'hard'];
const TEXTURE_LABELS: Record<string, string> = {
  vers: 'Vers', zacht: 'Zacht', halfzacht: 'Halfzacht', halfhard: 'Halfhard', hard: 'Hard',
};

function groupCheeses(cheeses: CheeseWithRatings[], sort: SortOption): CheeseSection[] {
  if (cheeses.length === 0) return [];

  switch (sort) {
    case 'textuur': {
      const map = new Map<string, CheeseWithRatings[]>();
      for (const c of cheeses) {
        if (!map.has(c.texture)) map.set(c.texture, []);
        map.get(c.texture)!.push(c);
      }
      const knownKeys = TEXTURE_ORDER.filter((k) => map.has(k));
      const otherKeys = [...map.keys()].filter((k) => !TEXTURE_ORDER.includes(k)).sort();
      return [...knownKeys, ...otherKeys].map((k) => ({
        title: TEXTURE_LABELS[k] ?? k.charAt(0).toUpperCase() + k.slice(1),
        data: map.get(k)!,
      }));
    }

    case 'naam': {
      const map = new Map<string, CheeseWithRatings[]>();
      for (const c of cheeses) {
        const letter = c.name.charAt(0).toUpperCase();
        if (!map.has(letter)) map.set(letter, []);
        map.get(letter)!.push(c);
      }
      return [...map.keys()].sort().map((letter) => ({ title: letter, data: map.get(letter)! }));
    }

    case 'nieuwst': {
      const map = new Map<string, CheeseWithRatings[]>();
      const order: string[] = [];
      for (const c of cheeses) {
        const raw = new Date(c.createdAt).toLocaleDateString('nl-BE', {
          month: 'long', year: 'numeric',
        });
        const key = raw.charAt(0).toUpperCase() + raw.slice(1);
        if (!map.has(key)) { map.set(key, []); order.push(key); }
        map.get(key)!.push(c);
      }
      return order.map((key) => ({ title: key, data: map.get(key)! }));
    }

    default: {
      // consensus — group by dominant (most-voted) rating
      const RATING_ORDER = ['heerlijk', 'lekker', 'eetbaar', 'vies', '_none'] as const;
      const RATING_LABELS: Record<string, string> = {
        heerlijk: 'Heerlijk', lekker: 'Lekker', eetbaar: 'Eetbaar', vies: 'Vies',
        _none: 'Niet beoordeeld',
      };
      const LEVELS: RatingLevel[] = ['heerlijk', 'lekker', 'eetbaar', 'vies'];
      const map = new Map<string, CheeseWithRatings[]>();
      for (const c of cheeses) {
        let key = '_none';
        if (c.ratings.length > 0) {
          const counts: Record<string, number> = {};
          for (const r of c.ratings) counts[r.rating] = (counts[r.rating] ?? 0) + 1;
          key = LEVELS.reduce((best, lvl) =>
            (counts[lvl] ?? 0) > (counts[best] ?? 0) ? lvl : best, LEVELS[0]);
        }
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(c);
      }
      return RATING_ORDER.filter((k) => map.has(k)).map((k) => ({
        title: RATING_LABELS[k],
        data: map.get(k)!,
      }));
    }
  }
}

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
  const [openPanel, setOpenPanel] = useState<'sort' | 'filter' | null>(null);

  const togglePanel = (panel: 'sort' | 'filter') =>
    setOpenPanel((prev) => (prev === panel ? null : panel));

  const cheesesWithRatings = useMemo(
    () => cheeses.map((c) => ({ ...c, ratings: ratingsMap[c.id] ?? [] })),
    [cheeses, ratingsMap]
  );

  const sections = useMemo(() => {
    const filtered = applySortAndFilter(cheesesWithRatings, sort, {
      textures: textureFilter,
      milkTypes: milkFilter,
    });
    return groupCheeses(filtered, sort);
  }, [cheesesWithRatings, sort, textureFilter, milkFilter]);

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
        {/* Toolbar */}
        <View style={styles.toolbar}>
          <Pressable
            style={[styles.toolbarBtn, openPanel === 'sort' && styles.toolbarBtnActive]}
            onPress={() => togglePanel('sort')}
          >
            <Text style={[styles.toolbarBtnText, openPanel === 'sort' && styles.toolbarBtnTextActive]}>
              {SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sortering'} ▾
            </Text>
          </Pressable>

          <Pressable
            style={[styles.toolbarBtn, (openPanel === 'filter' || activeFilterCount > 0) && styles.toolbarBtnActive]}
            onPress={() => togglePanel('filter')}
          >
            <Text style={[styles.toolbarBtnText, (openPanel === 'filter' || activeFilterCount > 0) && styles.toolbarBtnTextActive]}>
              {activeFilterCount > 0 ? `Filter (${activeFilterCount})` : 'Filter'} ▾
            </Text>
          </Pressable>
        </View>

        {/* Sort panel */}
        {openPanel === 'sort' && (
          <View style={styles.panel}>
            {SORT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.panelRow, sort === opt.value && styles.panelRowActive]}
                onPress={() => { setSort(opt.value); setOpenPanel(null); }}
              >
                <Text style={[styles.panelRowText, sort === opt.value && styles.panelRowTextActive]}>
                  {opt.label}
                </Text>
                {sort === opt.value && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
            ))}
          </View>
        )}

        {/* Filter panel */}
        {openPanel === 'filter' && (
          <View style={styles.panel}>
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
        ) : sections.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>🧀</Text>
            <Text style={styles.emptyTitle}>Nog geen kazen</Text>
            <Text style={styles.emptySubtitle}>Voeg je eerste kaas toe!</Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <CheeseCard
                cheese={item}
                ratings={item.ratings}
                users={users}
                onPress={() => router.push(`/cheeses/${item.id}`)}
              />
            )}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{section.title}</Text>
              </View>
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
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  toolbarBtn: {
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  toolbarBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toolbarBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  toolbarBtnTextActive: {
    color: '#FFFFFF',
  },
  panel: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  panelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: Radius.sm,
  },
  panelRowActive: {
    backgroundColor: `${Colors.primary}15`,
  },
  panelRowText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.text,
  },
  panelRowTextActive: {
    fontFamily: Fonts.bodyBold,
    color: Colors.primary,
  },
  checkmark: {
    fontSize: 15,
    color: Colors.primary,
    fontFamily: Fonts.bodyBold,
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
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionHeaderText: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: Colors.text,
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
