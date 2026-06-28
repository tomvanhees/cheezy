import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Colors, Fonts, Radius, Shadow } from '@/lib/theme';
import { RatingBadge } from './RatingBadge';
import { CheeseWedgeSvg } from './CheeseWedgeSvg';
import type { Cheese, Rating, AppUser } from '@/lib/types';

const TEXTURE_LABELS: Record<string, string> = {
  vers: 'Vers',
  zacht: 'Zacht',
  halfzacht: 'Halfzacht',
  halfhard: 'Halfhard',
  hard: 'Hard',
};

const MILK_LABELS: Record<string, string> = {
  koe: '🐄',
  geit: '🐐',
  schaap: '🐑',
  buffel: '🐃',
  gemengd: '🥛',
};

interface Props {
  cheese: Cheese;
  ratings: Rating[];
  users: AppUser[];
  onPress: () => void;
}

export function CheeseCard({ cheese, ratings, users, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      android_ripple={{ color: `${Colors.primary}22` }}
    >
      {/* Image */}
      <View style={styles.imageWrapper}>
        {cheese.imageUrl ? (
          <Image source={{ uri: cheese.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <CheeseWedgeSvg size={56} />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{cheese.name}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoChip}>{TEXTURE_LABELS[cheese.texture] ?? cheese.texture}</Text>
          <Text style={styles.infoChip}>{MILK_LABELS[cheese.milkType] ?? cheese.milkType}</Text>
          {cheese.origin ? <Text style={styles.infoChip} numberOfLines={1}>{cheese.origin}</Text> : null}
          {cheese.isSliced !== undefined && (
            <Text style={styles.infoChip}>{cheese.isSliced ? '✂️' : '🧀'}</Text>
          )}
        </View>

        {/* User ratings */}
        {ratings.length > 0 && (
          <View style={styles.ratingsRow}>
            {ratings.map((r) => {
              const user = users.find((u) => u.id === r.userId);
              return (
                <RatingBadge
                  key={r.userId}
                  rating={r.rating}
                  userName={user?.name}
                  small
                />
              );
            })}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    ...Shadow.card,
  },
  pressed: {
    opacity: 0.92,
  },
  imageWrapper: {
    width: 100,
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: `${Colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 6,
    justifyContent: 'center',
  },
  name: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: Colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  infoChip: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  ratingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
});
