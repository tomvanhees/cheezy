import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { SCHEMA_VERSION } from './schema';
import type { AppUser, Cheese, Rating, RatingLevel, Store } from './types';

// ── Stores ───────────────────────────────────────────────────────────────────

export function subscribeToStores(callback: (stores: Store[]) => void): () => void {
  return onSnapshot(
    query(collection(db, 'stores'), orderBy('name')),
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Store)));
    },
    () => {}
  );
}

export async function addStore(name: string): Promise<string> {
  const ref = await addDoc(collection(db, 'stores'), {
    name: name.trim(),
    createdAt: Date.now(),
  });
  return ref.id;
}

// ── Users ────────────────────────────────────────────────────────────────────

export function subscribeToUsers(callback: (users: AppUser[]) => void): () => void {
  return onSnapshot(
    collection(db, 'users'),
    (snap) => { callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppUser))); },
    () => {}
  );
}

export async function upsertUser(user: Omit<AppUser, 'createdAt'> & { id: string }): Promise<void> {
  await setDoc(
    doc(db, 'users', user.id),
    { ...user, createdAt: Date.now() },
    { merge: true }
  );
}

export async function updateUserPushToken(userId: string, token: string): Promise<void> {
  await updateDoc(doc(db, 'users', userId), { expoPushToken: token });
}

// ── Cheeses ──────────────────────────────────────────────────────────────────

export function subscribeToCheeses(callback: (cheeses: Cheese[]) => void): () => void {
  return onSnapshot(
    collection(db, 'cheeses'),
    (snap) => { callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cheese))); },
    () => {}
  );
}

export async function addCheese(
  data: Omit<Cheese, 'id' | 'createdAt' | '_schemaVersion'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'cheeses'), {
    ...data,
    createdAt: Date.now(),
    _schemaVersion: SCHEMA_VERSION,
  });
  return ref.id;
}

export async function updateCheese(
  id: string,
  data: Partial<Omit<Cheese, 'id' | 'createdAt' | '_schemaVersion'>>
): Promise<void> {
  await updateDoc(doc(db, 'cheeses', id), data);
}

export async function deleteCheese(id: string): Promise<void> {
  // Delete all ratings in the sub-collection first
  const ratingsSnap = await getDocs(collection(db, 'cheeses', id, 'ratings'));
  await Promise.all(ratingsSnap.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db, 'cheeses', id));
}

// ── Ratings ──────────────────────────────────────────────────────────────────

export function subscribeToRatings(
  cheeseId: string,
  callback: (ratings: Rating[]) => void
): () => void {
  return onSnapshot(
    collection(db, 'cheeses', cheeseId, 'ratings'),
    (snap) => { callback(snap.docs.map((d) => ({ cheeseId, ...d.data() } as Rating))); },
    () => {}
  );
}

export function subscribeToAllRatings(
  cheeseIds: string[],
  callback: (ratings: Record<string, Rating[]>) => void
): () => void {
  if (cheeseIds.length === 0) {
    callback({});
    return () => {};
  }

  const map: Record<string, Rating[]> = {};
  const unsubs: Array<() => void> = [];

  const notify = () => callback({ ...map });

  for (const cheeseId of cheeseIds) {
    const unsub = subscribeToRatings(cheeseId, (ratings) => {
      map[cheeseId] = ratings;
      notify();
    });
    unsubs.push(unsub);
  }

  return () => unsubs.forEach((u) => u());
}

export async function setRating(
  cheeseId: string,
  userId: string,
  rating: RatingLevel,
  note?: string
): Promise<void> {
  await setDoc(doc(db, 'cheeses', cheeseId, 'ratings', userId), {
    userId,
    cheeseId,
    rating,
    note: note ?? '',
    ratedAt: Date.now(),
    _schemaVersion: SCHEMA_VERSION,
  });
}
