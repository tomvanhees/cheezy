import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
  const [locations, setLocations] = useState<string[]>(cheese?.purchaseLocations ?? []);
  const [imageUri, setImageUri] = useState<string | undefined>();

  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetY = useRef(0);
  const scrollViewHeight = useRef(0);
  const focusedInputRef = useRef<TextInput | null>(null);

  const nameRef = useRef<TextInput>(null);
  const producerRef = useRef<TextInput>(null);

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
        purchaseLocations: locations,
      },
      imageUri,
    });
    router.back();
  };

  const currentImageUri = imageUri ?? cheese.imageUrl;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ title: 'Kaas bewerken' }} />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        onScroll={(e) => { scrollOffsetY.current = e.nativeEvent.contentOffset.y; }}
        scrollEventThrottle={100}
        onLayout={(e) => {
          const newHeight = e.nativeEvent.layout.height;
          const prevHeight = scrollViewHeight.current;
          scrollViewHeight.current = newHeight;
          // Only scroll when producer (bottom input) is focused — name is always visible near top
          if (Platform.OS === 'android' && focusedInputRef.current === producerRef.current && newHeight < prevHeight) {
            requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
          }
        }}
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
            ref={nameRef}
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor={Colors.textMuted}
            onFocus={() => { focusedInputRef.current = nameRef.current; }}
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
            ref={producerRef}
            style={styles.input}
            value={producer}
            onChangeText={setProducer}
            placeholder="Bijv. Beemster, Président"
            placeholderTextColor={Colors.textMuted}
            onFocus={() => { focusedInputRef.current = producerRef.current; }}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Herkomst</Text>
          <OriginPicker value={origin} onChange={setOrigin} />
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
    </KeyboardAvoidingView>
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
