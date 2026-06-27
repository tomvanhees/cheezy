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
import { Colors, Fonts, Radius } from '@/lib/theme';
import { ORIGINS } from '@/lib/cheeseData';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function OriginPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = ORIGINS.filter(
    (o) =>
      o.country.toLowerCase().includes(search.toLowerCase()) ||
      o.regions.some((r) => r.toLowerCase().includes(search.toLowerCase()))
  );

  const select = (v: string) => {
    onChange(v);
    setOpen(false);
    setSearch('');
    setExpanded(null);
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
        <View style={styles.modal}>
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
              <View key={origin.country}>
                <Pressable
                  style={styles.countryRow}
                  onPress={() =>
                    setExpanded(expanded === origin.country ? null : origin.country)
                  }
                >
                  <Text style={styles.countryText}>{origin.country}</Text>
                  <View style={styles.countryRight}>
                    <Pressable onPress={() => select(origin.country)} style={styles.selectCountryBtn}>
                      <Text style={styles.selectCountryText}>Selecteer</Text>
                    </Pressable>
                    <Text style={styles.expandArrow}>
                      {expanded === origin.country ? '▴' : '▾'}
                    </Text>
                  </View>
                </Pressable>

                {expanded === origin.country &&
                  origin.regions.map((region) => (
                    <Pressable
                      key={region}
                      style={styles.regionRow}
                      onPress={() => select(`${origin.country} — ${region}`)}
                    >
                      <Text style={styles.regionText}>{region}</Text>
                    </Pressable>
                  ))}
              </View>
            ))}
          </ScrollView>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    justifyContent: 'space-between',
  },
  countryText: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.text },
  countryRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  selectCountryBtn: {
    backgroundColor: `${Colors.primary}22`,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  selectCountryText: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.primaryDark },
  expandArrow: { color: Colors.textMuted, fontSize: 12 },
  regionRow: {
    paddingHorizontal: 32,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.border}88`,
  },
  regionText: { fontFamily: Fonts.body, fontSize: 15, color: Colors.textSecondary },
});
