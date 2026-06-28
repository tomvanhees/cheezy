import { Stack } from 'expo-router';
import { Colors } from '@/lib/theme';

export default function CheesesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontFamily: 'Fraunces_700Bold', fontSize: 20 },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
