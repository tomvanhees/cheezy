import { Stack } from 'expo-router';
import { Colors } from '@/lib/theme';

export default function CheeseDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontFamily: 'Fraunces_700Bold', fontSize: 18 },
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
