import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStores, useAddStore } from '@/hooks/useCheeses';
import { Colors, Fonts, Radius } from '@/lib/theme';

interface Props {
  value: string[];
  onChange: (stores: string[]) => void;
}

export function StorePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: stores = [] } = useStores();
  const addStore = useAddStore();

  const filtered = useMemo(
    () =>
      stores.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      ),
    [stores, search]
  );

  const trimmed = search.trim();
  const exactMatch = filtered.some(
    (s) => s.name.toLowerCase() === trimmed.toLowerCase()
  );

  const toggle = (name: string) => {
    onChange(value.includes(name) ? value.filter((s) => s !== name) : [...value, name]);
  };

  const addAndSelect = (name: string) => {
    if (!name.trim()) return;
    addStore.mutate(name.trim());
    if (!value.includes(name.trim())) {
      onChange([...value, name.trim()]);
    }
    setSearch('');
  };

  const close = () => {
    setOpen(false);
    setSearch('');
  };

  const triggerLabel =
    value.length === 0 ? 'Selecteer winkel(s)…' : value.join(', ');

  return (
    <>
      <Pressable
        style={styles.trigger}
        onPress={() => setOpen(true)}
        android_ripple={{ color: `${Colors.primary}22` }}
      >
        <Text
          style={[styles.triggerText, value.length === 0 && styles.placeholder]}
          numberOfLines={1}
        >
          {triggerLabel}
        </Text>
        <Text style={styles.arrow}>▾</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Winkels</Text>
            <Pressable onPress={close}>
              <Text style={styles.closeBtn}>Klaar</Text>
            </Pressable>
          </View>

          <TextInput
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder="Zoek of voeg winkel toe…"
            placeholderTextColor={Colors.textMuted}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => {
              if (!trimmed) return;
              if (!exactMatch) addAndSelect(trimmed);
              else toggle(trimmed);
            }}
          />

          <ScrollView contentContainerStyle={styles.list}>
            {trimmed && !exactMatch && (
              <Pressable
                style={styles.freeTextRow}
                onPress={() => addAndSelect(trimmed)}
              >
                <Text style={styles.freeTextLabel}>"{trimmed}" toevoegen</Text>
              </Pressable>
            )}

            {filtered.map((store) => {
              const selected = value.includes(store.name);
              return (
                <Pressable
                  key={store.id}
                  style={styles.row}
                  onPress={() => toggle(store.name)}
                >
                  <Text style={styles.rowText}>{store.name}</Text>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  placeholder: { color: Colors.textMuted },
  arrow: { color: Colors.textMuted, fontSize: 14 },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { fontFamily: Fonts.heading, fontSize: 20, color: Colors.text },
  closeBtn: { fontFamily: Fonts.bodySemiBold, fontSize: 16, color: Colors.primary },
  search: {
    margin: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  list: { paddingBottom: 40 },
  freeTextRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  freeTextLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowText: { fontFamily: Fonts.body, fontSize: 16, color: Colors.text, flex: 1 },
  checkmark: { fontSize: 16, color: Colors.primary, fontFamily: Fonts.bodySemiBold },
});
