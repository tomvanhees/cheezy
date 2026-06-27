import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Colors, Fonts, Radius } from '@/lib/theme';
import type { RatingLevel } from '@/lib/types';

const LEVELS: { value: RatingLevel; label: string; emoji: string }[] = [
  { value: 'vies', label: 'Vies', emoji: '🤢' },
  { value: 'eetbaar', label: 'Eetbaar', emoji: '😐' },
  { value: 'lekker', label: 'Lekker', emoji: '😋' },
  { value: 'heerlijk', label: 'Heerlijk', emoji: '🤩' },
];

interface Props {
  value?: RatingLevel;
  onChange: (rating: RatingLevel) => void;
}

export function RatingPicker({ value, onChange }: Props) {
  const scales = useRef(LEVELS.map(() => new Animated.Value(1))).current;

  const handlePress = (rating: RatingLevel, index: number) => {
    Animated.sequence([
      Animated.spring(scales[index], { toValue: 1.15, useNativeDriver: true }),
      Animated.spring(scales[index], { toValue: 1, useNativeDriver: true }),
    ]).start();
    onChange(rating);
  };

  return (
    <View style={styles.row}>
      {LEVELS.map((level, i) => {
        const selected = value === level.value;
        const bg = Colors.rating[level.value];
        return (
          <Animated.View key={level.value} style={{ transform: [{ scale: scales[i] }], flex: 1 }}>
            <Pressable
              style={[
                styles.btn,
                { backgroundColor: selected ? bg : `${bg}22` },
                selected && styles.selected,
              ]}
              onPress={() => handlePress(level.value, i)}
              android_ripple={{ color: `${bg}44` }}
            >
              <Text style={styles.emoji}>{level.emoji}</Text>
              <Text style={[styles.label, { color: selected ? '#fff' : bg }]}>{level.label}</Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  selected: {
    shadowColor: '#00000044',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  emoji: {
    fontSize: 22,
  },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
  },
});
