import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_COLORS } from '@/lib/cheeseData';
import { upsertUser } from '@/lib/firestore';
import type { AppUser } from '@/lib/types';

const USER_STORAGE_KEY = '@cheezy/current_user';

interface UserContextValue {
  user: AppUser | null;
  isLoading: boolean;
  setUser: (user: AppUser) => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  isLoading: true,
  setUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(USER_STORAGE_KEY)
      .then((raw) => {
        if (raw) setUserState(JSON.parse(raw) as AppUser);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const setUser = async (newUser: AppUser) => {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    setUserState(newUser);
    await upsertUser(newUser);
  };

  return (
    <UserContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

export function generateUserId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function pickUserColor(existingColors: string[]): string {
  const unused = USER_COLORS.filter((c) => !existingColors.includes(c));
  return unused.length > 0
    ? unused[0]
    : USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}
