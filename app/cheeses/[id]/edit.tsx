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
import * as ImagePicker from 'expo-image-picker';
import { useCheeses, useUpdateCheese } from '@/hooks/useCheeses';
import { ChipPicker } from '@/components/ChipPicker';
import { OriginPicker } from '@/components/OriginPicker';
import { CheeseWedgeSvg } from '@/components/CheeseWedgeSvg';
import { Colors, Fonts, Radius } from '@/lib/theme';
import { TEXTURES, MILK_TYPES } from '@/lib/cheeseData';

export default function EditCheeseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: cheeses = [] } = useCheeses();
  const cheese = cheeses.find((c) => c.id === id);
  const updateCheese = useUpdateCheese();

  const [name, setName] = useState(cheese?.name ?? '');
  const [texture, setTexture] = useState(cheese?.texture ?? '');
  const [milkType, setMilkType] = useState(cheese?.milkType ?? '');
  const [origin, setOrigin] = useState(cheese?.origin ?? '');
  const [locations, setLocations] = useState<string[]>(cheese?.purchaseLocations ?? []);
  const [newLocation, setNewLocation] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();

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

  const addLocation = () => {
    const trimmed = newLocation.trim();
    if (trimmed && !locations.includes(trimmed)) {
      setLocations([...locations, trimmed]);
      setNewLocation('');
    }
  };

  const removeLocation = (loc: string) => setLocations(locations.filter((l) => l !== loc));

  const handleSave = async () => {
    await updateCheese.mutateAsync({
      id,
      data: {
        name: name.trim(),
        texture: texture as any,
        milkType: milkType as any,
        origin,
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
          <Text style={styles.fieldLabel}>Herkomst</Text>
          <OriginPicker value={origin} onChange={setOrigin} />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Aankooplocaties</Text>
          {locations.map((loc) => (
            <View key={loc} style={styles.locationRow}>
              <Text style={styles.locationText}>{loc}</Text>
              <Pressable onPress={() => removeLocation(loc)}>
                <Text style={styles.removeBtn}>✕</Text>
              </Pressable>
            </View>
          ))}
          <View style={styles.addLocationRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newLocation}
              onChangeText={setNewLocation}
              placeholder="Locatie toevoegen"
              placeholderTextColor={Colors.textMuted}
              onSubmitEditing={addLocation}
              returnKeyType="done"
            />
            <Pressable style={styles.addBtn} onPress={addLocation}>
              <Text style={styles.addBtnText}>+</Text>
            </Pressable>
          </View>
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'space-between',
  },
  locationText: { fontFamily: Fonts.body, fontSize: 15, color: Colors.text },
  removeBtn: { fontSize: 16, color: Colors.rating.vies, paddingHorizontal: 4 },
  addLocationRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 24, color: '#FFFFFF', lineHeight: 28 },
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
