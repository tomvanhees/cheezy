import type { Persistence } from 'firebase/auth';

// getReactNativePersistence exists in the Metro RN bundle (react-native field in
// @firebase/auth/package.json) but is absent from the browser type declarations.
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
