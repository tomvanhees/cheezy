import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { CheeseWedgeSvg } from '@/components/CheeseWedgeSvg';
import { Colors, Fonts, Radius } from '@/lib/theme';

export default function SignInScreen() {
  const { user, isLoading, signIn } = useUser();
  const [signing, setSigning] = useState(false);
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

  const handleSignIn = async () => {
    setSigning(true);
    setError('');
    try {
      await signIn();
    } catch {
      setError('Aanmelden mislukt. Probeer opnieuw.');
      setSigning(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.hero}>
        <CheeseWedgeSvg size={150} />
        <Text style={styles.title}>Cheezy</Text>
        <Text style={styles.subtitle}>Jouw persoonlijk kaaslogboek</Text>
      </View>

      <View style={styles.form}>
        <Pressable
          style={[styles.btn, signing && styles.btnDisabled]}
          onPress={handleSignIn}
          disabled={signing}
          android_ripple={{ color: '#FFFFFF44' }}
        >
          {signing
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Aanmelden met Google</Text>
          }
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
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
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 17,
    color: '#FFFFFF',
  },
  error: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.rating.vies,
    textAlign: 'center',
  },
});
