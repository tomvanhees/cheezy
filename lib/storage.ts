import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { storage } from './firebase';

export async function compressAndUploadImage(
  localUri: string,
  cheeseId: string
): Promise<string> {
  // Compress: max 1200px wide, 80% quality
  const compressed = await manipulateAsync(
    localUri,
    [{ resize: { width: 1200 } }],
    { compress: 0.8, format: SaveFormat.JPEG }
  );

  const response = await fetch(compressed.uri);
  const blob = await response.blob();

  const storageRef = ref(storage, `cheeses/${cheeseId}/photo.jpg`);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

export async function deleteCheeseImage(cheeseId: string): Promise<void> {
  try {
    const storageRef = ref(storage, `cheeses/${cheeseId}/photo.jpg`);
    await deleteObject(storageRef);
  } catch {
    // Ignore if file doesn't exist
  }
}
