import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMergedOptions, saveIfNew } from '@/lib/options';
import { Colors, Fonts, Radius } from '@/lib/theme';

interface Props {
  value: string[];
  onChange: (stores: string[]) => void;
}

export function StorePicker({ value, onChange }: Props) {
  const [newStore, setNewStore] = useState('');
  const queryClient = useQueryClient();

  const { data: savedOptions = [] } = useQuery({
    queryKey: ['options', 'storeLocations'],
    queryFn: () => getMergedOptions('storeLocations'),
    staleTime: 5 * 60 * 1000,
  });

  // Also surface any previously-saved names that aren't in the shared list yet
  const options = useMemo(() => {
    const knownValues = new Set(savedOptions.map((o) => o.value));
    const extra = value
      .filter((v) => !knownValues.has(v))
      .map((v) => ({ value: v, label: v }));
    return [...savedOptions, ...extra];
  }, [savedOptions, value]);

  const toggle = (store: string) => {
    onChange(
      value.includes(store)
        ? value.filter((s) => s !== store)
        : [...value, store]
    );
  };

  const addStore = async () => {
    const trimmed = newStore.trim();
    if (!trimmed) return;
    setNewStore('');
    await saveIfNew('storeLocations', trimmed);
    queryClient.invalidateQueries({ queryKey: ['options', 'storeLocations'] });
    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Winkels</Text>

      {options.length > 0 && (
        <View style={styles.chips}>
          {options.map((opt) => {
            const selected = value.includes(opt.value);
            return (
              <Pressable
                key={opt.value}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => toggle(opt.value)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={newStore}
          onChangeText={setNewStore}
          placeholder="Winkel toevoegen…"
          placeholderTextColor={Colors.textMuted}
          onSubmitEditing={addStore}
          returnKeyType="done"
        />
        <Pressable style={styles.addBtn} onPress={addStore}>
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  label: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: `${Colors.primary}15`,
    borderColor: Colors.primary,
  },
  chipText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textSecondary },
  chipTextSelected: { color: Colors.primaryDark },
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 24, color: '#FFFFFF', lineHeight: 28 },
});
