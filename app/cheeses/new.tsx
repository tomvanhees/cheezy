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
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@/context/UserContext';
import { useAddCheese } from '@/hooks/useCheeses';
import { useCheeseDetection } from '@/hooks/useCheeseDetection';
import { ChipPicker } from '@/components/ChipPicker';
import { OriginPicker } from '@/components/OriginPicker';
import { CheeseWedgeSvg } from '@/components/CheeseWedgeSvg';
import { Colors, Fonts, Radius } from '@/lib/theme';
import { TEXTURES, MILK_TYPES, CHEESE_FAMILIES, AGING_PERIODS } from '@/lib/cheeseData';
import { getMergedOptions } from '@/lib/options';

export default function NewCheeseScreen() {
  const { user } = useUser();
  const addCheese = useAddCheese();
  const detect = useCheeseDetection();

  const [name, setName] = useState('');
  const [texture, setTexture] = useState('');
  const [milkType, setMilkType] = useState('');
  const [origin, setOrigin] = useState('');
  const [cheeseFamily, setCheeseFamily] = useState('');
  const [agingPeriod, setAgingPeriod] = useState('');
  const [producer, setProducer] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState('');
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

  const handleScan = async (source: 'camera' | 'gallery') => {
    try {
      const result = await detect.mutateAsync(source);
      if (!result) return;

      const { imageUri: scannedUri, detected } = result;
      setImageUri(scannedUri);

      if (!detected.name) {
        Alert.alert(
          'Geen kaas gevonden',
          'Ik kon geen kaas herkennen in de foto. Je kunt de naam zelf invullen.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Pre-fill form with detected values; don't overwrite fields the user already filled in
      if (!name) setName(detected.name);
      if (!texture && detected.texture) setTexture(detected.texture);
      if (!milkType && detected.milkType) setMilkType(detected.milkType);
      if (!origin && detected.origin) setOrigin(detected.origin);
      if (!cheeseFamily && detected.cheeseFamily) setCheeseFamily(detected.cheeseFamily);
      if (!agingPeriod && detected.agingPeriod) setAgingPeriod(detected.agingPeriod);
      if (!producer && detected.producer) setProducer(detected.producer);

      if (detected.confidence === 'laag') {
        Alert.alert(
          'Lage zekerheid',
          `Ik denk dat het "${detected.name}" is, maar ik ben er niet zeker van. Controleer even of het klopt.`,
          [{ text: 'Begrepen' }]
        );
      }
    } catch {
      Alert.alert(
        'Herkenning mislukt',
        'Kon de kaas niet herkennen. Controleer je verbinding en probeer opnieuw.',
        [{ text: 'OK' }]
      );
    }
  };

  const addLocation = () => {
    const trimmed = newLocation.trim();
    if (trimmed && !locations.includes(trimmed)) {
      setLocations([...locations, trimmed]);
      setNewLocation('');
    }
  };

  const removeLocation = (loc: string) => {
    setLocations(locations.filter((l) => l !== loc));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Naam vereist', 'Geef de kaas een naam.');
      return;
    }
    if (!texture) {
      Alert.alert('Textuur vereist', 'Selecteer de textuur van de kaas.');
      return;
    }
    if (!milkType) {
      Alert.alert('Melksoort vereist', 'Selecteer de melksoort.');
      return;
    }

    try {
      const result = await addCheese.mutateAsync({
        data: {
          name: name.trim(),
          texture,
          milkType,
          origin,
          cheeseFamily,
          agingPeriod,
          producer: producer.trim(),
          purchaseLocations: locations,
          createdBy: user!.id,
        },
        imageUri,
      });

      if (result.imageUploadFailed) {
        Alert.alert(
          'Foto niet opgeslagen',
          'De kaas is opgeslagen, maar de foto kon niet worden geüpload. Je kunt de foto later bewerken.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        router.back();
      }
    } catch {
      Alert.alert(
        'Opslaan mislukt',
        'Kon de kaas niet opslaan. Controleer je verbinding en probeer opnieuw.',
        [{ text: 'OK' }]
      );
    }
  };

  const isDetecting = detect.isPending;

  return (
    <>
      <Stack.Screen options={{ title: 'Kaas toevoegen' }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {/* Scan banner */}
        <View style={styles.scanBanner}>
          <Text style={styles.scanTitle}>🔍 Kaas herkennen</Text>
          <Text style={styles.scanSubtitle}>
            Maak een foto van de kaas of het etiket — wij vullen de naam in.
          </Text>
          <View style={styles.scanButtons}>
            <Pressable
              style={[styles.scanBtn, isDetecting && styles.scanBtnDisabled]}
              onPress={() => handleScan('camera')}
              disabled={isDetecting}
              android_ripple={{ color: '#FFFFFF44' }}
            >
              {isDetecting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.scanBtnText}>📷 Camera scannen</Text>
              )}
            </Pressable>
            <Pressable
              style={[styles.scanBtnSecondary, isDetecting && styles.scanBtnDisabled]}
              onPress={() => handleScan('gallery')}
              disabled={isDetecting}
              android_ripple={{ color: `${Colors.primary}33` }}
            >
              <Text style={styles.scanBtnSecondaryText}>📁 Uit gallerij</Text>
            </Pressable>
          </View>
          {isDetecting && (
            <Text style={styles.detectingText}>Kaas herkennen…</Text>
          )}
        </View>

        {/* Image preview (set by scan or manual pick) */}
        <View style={styles.imageSection}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <CheeseWedgeSvg size={80} />
              <Text style={styles.imagePlaceholderText}>Geen foto</Text>
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
          <Text style={styles.imageHint}>
            Foto toevoegen zonder herkenning? Gebruik de knoppen hierboven.
          </Text>
        </View>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Naam *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Bijv. Époisses"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Texture */}
        <View style={styles.field}>
          <ChipPicker
            label="Textuur *"
            options={TEXTURES}
            value={texture}
            onChange={setTexture}
          />
        </View>

        {/* Milk type */}
        <View style={styles.field}>
          <ChipPicker
            label="Melksoort *"
            options={MILK_TYPES}
            value={milkType}
            onChange={setMilkType}
          />
        </View>

        {/* Cheese family */}
        <View style={styles.field}>
          <ChipPicker
            label="Kaassoort"
            options={cheeseFamilyOptions}
            value={cheeseFamily}
            onChange={setCheeseFamily}
          />
        </View>

        {/* Aging period */}
        <View style={styles.field}>
          <ChipPicker
            label="Rijping"
            options={agingOptions}
            value={agingPeriod}
            onChange={setAgingPeriod}
          />
        </View>

        {/* Producer */}
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

        {/* Origin */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Herkomst</Text>
          <OriginPicker value={origin} onChange={setOrigin} />
        </View>

        {/* Purchase locations */}
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
              placeholder="Bijv. Carrefour Gent"
              placeholderTextColor={Colors.textMuted}
              onSubmitEditing={addLocation}
              returnKeyType="done"
            />
            <Pressable style={styles.addBtn} onPress={addLocation}>
              <Text style={styles.addBtnText}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Save */}
        <Pressable
          style={[styles.saveBtn, addCheese.isPending && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={addCheese.isPending}
          android_ripple={{ color: '#FFFFFF44' }}
        >
          {addCheese.isPending
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Kaas opslaan 🧀</Text>
          }
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 20, gap: 20, paddingBottom: 40 },

  // Scan banner
  scanBanner: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  scanTitle: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.text },
  scanSubtitle: { fontFamily: Fonts.body, fontSize: 13, color: Colors.textSecondary },
  scanButtons: { flexDirection: 'row', gap: 8 },
  scanBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  scanBtnDisabled: { opacity: 0.6 },
  scanBtnText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: '#FFFFFF' },
  scanBtnSecondary: {
    flex: 1,
    borderRadius: Radius.full,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  scanBtnSecondaryText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.primaryDark },
  detectingText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Image
  imageSection: { alignItems: 'center', gap: 8 },
  image: { width: '100%', height: 200, borderRadius: Radius.lg },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: Radius.lg,
    backgroundColor: `${Colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePlaceholderText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.textMuted },
  imageButtons: { flexDirection: 'row', gap: 10, width: '100%' },
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
  imageHint: { fontFamily: Fonts.body, fontSize: 11, color: Colors.textMuted, textAlign: 'center' },

  // Form
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
