import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useCheeses, useUpdateCheese } from '@/hooks/useCheeses';
import { ChipPicker } from '@/components/ChipPicker';
import { OriginPicker } from '@/components/OriginPicker';
import { CheeseWedgeSvg } from '@/components/CheeseWedgeSvg';
import { StorePicker } from '@/components/StorePicker';
import { Colors, Fonts, Radius } from '@/lib/theme';
import { TEXTURES, MILK_TYPES, CHEESE_FAMILIES, AGING_PERIODS } from '@/lib/cheeseData';
import { getMergedOptions } from '@/lib/options';

export default function EditCheeseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: cheeses = [] } = useCheeses();
  const cheese = cheeses.find((c) => c.id === id);
  const updateCheese = useUpdateCheese();

  const [name, setName] = useState(cheese?.name ?? '');
  const [texture, setTexture] = useState(cheese?.texture ?? '');
  const [milkType, setMilkType] = useState(cheese?.milkType ?? '');
  const [origin, setOrigin] = useState(cheese?.origin ?? '');
  const [cheeseFamily, setCheeseFamily] = useState(cheese?.cheeseFamily ?? '');
  const [agingPeriod, setAgingPeriod] = useState(cheese?.agingPeriod ?? '');
  const [producer, setProducer] = useState(cheese?.producer ?? '');
  const [isSliced, setIsSliced] = useState<boolean | undefined>(cheese?.isSliced);
  const [locations, setLocations] = useState<string[]>(cheese?.purchaseLocations ?? []);
  const [imageUri, setImageUri] = useState<string | undefined>();

  const { data: cheeseFamilyOptions = CHEESE_FAMILIES.map((f) => ({ value: f.value, label: f.label })) } = useQuery({
    queryKey: ['options', 'cheeseFamilies'],
    queryFn: () => getMergedOptions('cheeseFamilies'),
    staleTime: 5 * 60 * 1000,
  });
  const { data: agingOptions = AGING_PERIODS.map((a) => ({ value: a.value, label: a.label })) } = useQuery({
    queryKey: ['options', 'agingPeriods'],
    queryFn: () => getMergedOptions('agingPeriods'),
    staleTime: 5 * 60 * 1000,
  });

  if (!cheese) return null;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    await updateCheese.mutateAsync({
      id,
      data: {
        name: name.trim(),
        texture,
        milkType,
        origin,
        cheeseFamily,
        agingPeriod,
        producer: producer.trim(),
        isSliced,
        purchaseLocations: locations,
      },
      imageUri,
    });
    router.back();
  };

  const currentImageUri = imageUri ?? cheese.imageUrl;

  return (
    <>
      <Stack.Screen options={{ title: 'Kaas bewerken' }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image picker */}
        <View style={styles.imageSection}>
          {currentImageUri ? (
            <Image source={{ uri: currentImageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <CheeseWedgeSvg size={80} />
            </View>
          )}
          <View style={styles.imageButtons}>
            <Pressable style={styles.imageBtn} onPress={pickImage}>
              <Text style={styles.imageBtnText}>📁 Gallerij</Text>
            </Pressable>
            <Pressable style={styles.imageBtn} onPress={takePhoto}>
              <Text style={styles.imageBtnText}>📷 Camera</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Naam</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <ChipPicker label="Textuur" options={TEXTURES} value={texture} onChange={setTexture} />
        </View>

        <View style={styles.field}>
          <ChipPicker label="Melksoort" options={MILK_TYPES} value={milkType} onChange={setMilkType} />
        </View>

        <View style={styles.field}>
          <ChipPicker label="Kaassoort" options={cheeseFamilyOptions} value={cheeseFamily} onChange={setCheeseFamily} />
        </View>

        <View style={styles.field}>
          <ChipPicker label="Rijping" options={agingOptions} value={agingPeriod} onChange={setAgingPeriod} />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Producent / Merk</Text>
          <TextInput
            style={styles.input}
            value={producer}
            onChangeText={setProducer}
            placeholder="Bijv. Beemster, Président"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Herkomst</Text>
          <OriginPicker value={origin} onChange={setOrigin} />
        </View>

        {/* Sliced */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Vorm</Text>
          <View style={styles.slicedRow}>
            {([{ v: false, label: 'Heel stuk' }, { v: true, label: 'Gesneden' }] as const).map(({ v, label }) => (
              <Pressable
                key={label}
                style={[styles.slicedChip, isSliced === v && styles.slicedChipActive]}
                onPress={() => setIsSliced(isSliced === v ? undefined : v)}
              >
                <Text style={[styles.slicedChipText, isSliced === v && styles.slicedChipTextActive]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <StorePicker value={locations} onChange={setLocations} />
        </View>

        <Pressable
          style={[styles.saveBtn, updateCheese.isPending && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={updateCheese.isPending}
          android_ripple={{ color: '#FFFFFF44' }}
        >
          {updateCheese.isPending
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Wijzigingen opslaan</Text>
          }
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  imageSection: { alignItems: 'center', gap: 12 },
  image: { width: '100%', height: 200, borderRadius: Radius.lg },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: Radius.lg,
    backgroundColor: `${Colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButtons: { flexDirection: 'row', gap: 10 },
  imageBtn: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  imageBtnText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.text },
  field: { gap: 8 },
  fieldLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textSecondary },
  input: {
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
  slicedRow: { flexDirection: 'row', gap: 8 },
  slicedChip: {
    flex: 1,
    borderRadius: Radius.full,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  slicedChipActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}15`,
  },
  slicedChipText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.textSecondary },
  slicedChipTextActive: { color: Colors.primaryDark },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { fontFamily: Fonts.bodyBold, fontSize: 17, color: '#FFFFFF' },
});
