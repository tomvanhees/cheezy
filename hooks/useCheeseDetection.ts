import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { functions } from '@/lib/firebase';
import type { DetectedCheese, DetectCheeseRequest } from '@/lib/types';

export type { DetectedCheese };

async function captureAndDetect(
  source: 'camera' | 'gallery'
): Promise<{ imageUri: string; detected: DetectedCheese } | null> {
  // Pick / capture the image
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

  if (result.canceled) return null;

  const originalUri = result.assets[0].uri;

  // Compress to max 1200px / 80% before sending (keeps base64 under ~300 KB)
  const compressed = await ImageManipulator.manipulateAsync(
    originalUri,
    [{ resize: { width: 1200 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );

  // Read as base64
  const imageBase64 = await FileSystem.readAsStringAsync(compressed.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Call the Cloud Function
  const fn = httpsCallable<DetectCheeseRequest, DetectedCheese>(functions, 'detectCheese');
  const response = await fn({ imageBase64, mimeType: 'image/jpeg' });

  return { imageUri: compressed.uri, detected: response.data };
}

export function useCheeseDetection() {
  return useMutation({
    mutationFn: (source: 'camera' | 'gallery') => captureAndDetect(source),
  });
}
