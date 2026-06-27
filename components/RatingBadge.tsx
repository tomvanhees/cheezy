import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Radius } from '@/lib/theme';
import type { RatingLevel } from '@/lib/types';

const LABELS: Record<RatingLevel, string> = {
  vies: 'Vies',
  eetbaar: 'Eetbaar',
  lekker: 'Lekker',
  heerlijk: 'Heerlijk',
};

interface Props {
  rating: RatingLevel;
  userName?: string;
  small?: boolean;
}

export function RatingBadge({ rating, userName, small }: Props) {
  const bgColor = Colors.rating[rating];
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, small && styles.small]}>
      {userName && (
        <Text style={[styles.userName, small && styles.userNameSmall]} numberOfLines={1}>
          {userName}
        </Text>
      )}
      <Text style={[styles.label, small && styles.labelSmall]}>{LABELS[rating]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  userName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  userNameSmall: {
    fontSize: 10,
  },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  labelSmall: {
    fontSize: 11,
  },
});
