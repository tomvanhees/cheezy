import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useUser, generateUserId, pickUserColor } from '@/context/UserContext';
import { CheeseWedgeSvg } from '@/components/CheeseWedgeSvg';
import { Colors, Fonts, Radius } from '@/lib/theme';
import { subscribeToUsers } from '@/lib/firestore';
import { ensureSchema } from '@/lib/schema';

export default function OnboardingScreen() {
  const { user, isLoading, setUser } = useUser();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!isLoading && user) {
      router.replace('/cheeses');
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const handleConfirm = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Vul je naam in.');
      return;
    }
    setSaving(true);
    try {
      await ensureSchema();

      const existingUsers = await new Promise<{ color: string }[]>((resolve) => {
        const unsub = subscribeToUsers((users) => {
          unsub();
          resolve(users);
        });
      });

      const color = pickUserColor(existingUsers.map((u) => u.color));
      const id = generateUserId();

      await setUser({
        id,
        name: trimmed,
        color,
        createdAt: Date.now(),
      });

      router.replace('/cheeses');
    } catch (e) {
      setError('Er ging iets mis. Probeer opnieuw.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.hero}>
        <CheeseWedgeSvg size={150} />
        <Text style={styles.title}>Cheezy</Text>
        <Text style={styles.subtitle}>Jouw persoonlijk kaaslogboek</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.question}>Hoe heet jij?</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(t) => { setName(t); setError(''); }}
          placeholder="Bijv. Tom of Lisa"
          placeholderTextColor={Colors.textMuted}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleConfirm}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.btn, saving && styles.btnDisabled]}
          onPress={handleConfirm}
          disabled={saving}
          android_ripple={{ color: '#FFFFFF44' }}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Laten we beginnen! 🧀</Text>
          }
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 40,
  },
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 48,
    color: Colors.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    gap: 14,
  },
  question: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  error: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.rating.vies,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 17,
    color: '#FFFFFF',
  },
});
