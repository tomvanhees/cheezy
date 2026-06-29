import React, { useState } from 'react';
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
import { Colors, Fonts, Radius } from '@/lib/theme';
import { ORIGINS } from '@/lib/cheeseData';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function OriginPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = ORIGINS.filter((o) =>
    o.country.toLowerCase().includes(search.toLowerCase())
  );

  const select = (v: string) => {
    onChange(v);
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      <Pressable
        style={styles.trigger}
        onPress={() => setOpen(true)}
        android_ripple={{ color: `${Colors.primary}22` }}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {value || 'Selecteer herkomst…'}
        </Text>
        <Text style={styles.arrow}>▾</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Herkomst</Text>
            <Pressable onPress={() => { setOpen(false); setSearch(''); }}>
              <Text style={styles.closeBtn}>Sluiten</Text>
            </Pressable>
          </View>

          <TextInput
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder="Zoek land of regio…"
            placeholderTextColor={Colors.textMuted}
            autoFocus
          />

          <ScrollView contentContainerStyle={styles.list}>
            {/* Free text option if searching */}
            {search.trim() && !filtered.some((o) => o.country === search) && (
              <Pressable style={styles.freeTextRow} onPress={() => select(search.trim())}>
                <Text style={styles.freeTextLabel}>"{search.trim()}" gebruiken</Text>
              </Pressable>
            )}

            {filtered.map((origin) => (
              <Pressable
                key={origin.country}
                style={styles.countryRow}
                onPress={() => select(origin.country)}
              >
                <Text style={styles.countryText}>{origin.country}</Text>
              </Pressable>
            ))}
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
  countryRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  countryText: { fontFamily: Fonts.body, fontSize: 16, color: Colors.text },
});
