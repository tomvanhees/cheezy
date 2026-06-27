import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Current schema version. Increment this when the Firestore data model changes.
 * Migration logic below must handle all previous versions.
 *
 * History:
 *   1 — initial schema (users, cheeses, ratings sub-collection)
 */
export const SCHEMA_VERSION = 1;

export interface SchemaMetaDoc {
  version: number;
  migratedAt: unknown;
}

/**
 * Check the deployed schema version and run any needed migrations.
 * Called once on app startup, before any data reads.
 */
export async function ensureSchema(): Promise<void> {
  const metaRef = doc(db, '_meta', 'schema');
  const snap = await getDoc(metaRef);

  if (!snap.exists()) {
    // Fresh install — write the current version
    await setDoc(metaRef, {
      version: SCHEMA_VERSION,
      migratedAt: serverTimestamp(),
    });
    return;
  }

  const { version } = snap.data() as SchemaMetaDoc;

  if (version === SCHEMA_VERSION) return;

  // Run migrations in order
  // Example: if (version < 2) await migrateV1toV2();
  // After all migrations, update the version document
  await setDoc(metaRef, {
    version: SCHEMA_VERSION,
    migratedAt: serverTimestamp(),
  });
}
