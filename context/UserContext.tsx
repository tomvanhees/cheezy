import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { upsertUser, subscribeToUsers } from '@/lib/firestore';
import { ensureSchema } from '@/lib/schema';
import { USER_COLORS } from '@/lib/cheeseData';
import type { AppUser } from '@/lib/types';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

interface UserContextValue {
  user: AppUser | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

function pickColor(existingColors: string[]): string {
  const unused = USER_COLORS.filter((c) => !existingColors.includes(c));
  return unused.length > 0
    ? unused[0]
    : USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      await ensureSchema();

      const snap = await getDoc(doc(db, 'users', firebaseUser.uid));

      let appUser: AppUser;
      if (snap.exists()) {
        appUser = { id: snap.id, ...snap.data() } as AppUser;
      } else {
        // First sign-in — pick an unused colour
        const existingUsers = await new Promise<AppUser[]>((resolve) => {
          const unsubscribe = subscribeToUsers((users) => {
            unsubscribe();
            resolve(users);
          });
        });
        const color = pickColor(existingUsers.map((u) => u.color));
        appUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName ?? 'Gebruiker',
          color,
          createdAt: Date.now(),
        };
        await upsertUser(appUser);
      }

      setUser(appUser);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async () => {
    await GoogleSignin.hasPlayServices();
    const result = await GoogleSignin.signIn();
    if (result.type !== 'success' || !result.data.idToken) return;
    const credential = GoogleAuthProvider.credential(result.data.idToken);
    await signInWithCredential(auth, credential);
    // onAuthStateChanged handles the rest
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    await GoogleSignin.signOut();
  };

  return (
    <UserContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
