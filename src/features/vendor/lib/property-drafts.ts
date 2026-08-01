import { getCurrentAccountKey } from "@/lib/account-identity";

export const PROPERTY_DRAFT_TTL_MS = 60 * 60 * 1000;
const DRAFTS_KEY_PREFIX = "propertyark.vendor.property-drafts.v3";
const MEDIA_DB = "propertyark-property-drafts";
const MEDIA_STORE = "media";

export interface PropertyDraft<T> {
  id: string;
  values: T;
  step: number;
  updatedAt: string;
  expiresAt: string;
}

export interface PropertyDraftMedia {
  photos: File[];
  videos: File[];
  documents: { ownership: File[]; identification: File[]; tax: File[] };
}

function ownerKey() {
  return getCurrentAccountKey() ?? "unresolved-session";
}

function draftsKey() {
  // Scope drafts to the authenticated account to prevent cross-account leakage.
  return `${DRAFTS_KEY_PREFIX}:${encodeURIComponent(ownerKey())}`;
}

function mediaKey(id: string) {
  return `${ownerKey()}:${id}`;
}

function readRaw<T>(): PropertyDraft<T>[] {
  if (typeof window === "undefined") return [];
  localStorage.removeItem("propertyark.vendor.property-draft.v1");
  try {
    const value = JSON.parse(localStorage.getItem(draftsKey()) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function write<T>(drafts: PropertyDraft<T>[]) {
  localStorage.setItem(draftsKey(), JSON.stringify(drafts));
  window.dispatchEvent(new Event("propertyark:drafts-changed"));
}

function openMediaDb() {
  // IndexedDB is used only for File objects; draft form fields remain lightweight.
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(MEDIA_DB, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore(MEDIA_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteDraftMedia(id: string) {
  const db = await openMediaDb();
  await new Promise<void>((resolve, reject) => {
    const request = db
      .transaction(MEDIA_STORE, "readwrite")
      .objectStore(MEDIA_STORE)
      .delete(mediaKey(id));
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}

export async function cleanupExpiredDrafts<T>() {
  const now = Date.now();
  const drafts = readRaw<T>();
  const active = drafts.filter(
    (draft) => new Date(draft.expiresAt).getTime() > now,
  );
  const expired = drafts.filter(
    (draft) => new Date(draft.expiresAt).getTime() <= now,
  );
  if (expired.length) {
    // Keep localStorage and IndexedDB in sync when the one-hour TTL elapses.
    write(active);
    await Promise.allSettled(
      expired.map((draft) => deleteDraftMedia(draft.id)),
    );
  }
  return active;
}

export async function getPropertyDrafts<T>() {
  return cleanupExpiredDrafts<T>();
}

export async function getPropertyDraft<T>(id: string) {
  return (
    (await cleanupExpiredDrafts<T>()).find((draft) => draft.id === id) ?? null
  );
}

export function savePropertyDraft<T>(
  values: T,
  step: number,
  existingId?: string | null,
) {
  // Reuse the ID when editing so autosave updates rather than duplicates a draft.
  const id = existingId ?? crypto.randomUUID();
  const now = new Date();
  const draft: PropertyDraft<T> = {
    id,
    values,
    step,
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + PROPERTY_DRAFT_TTL_MS).toISOString(),
  };
  const drafts = readRaw<T>().filter(
    (item) => item.id !== id && new Date(item.expiresAt).getTime() > Date.now(),
  );
  write([draft, ...drafts]);
  return draft;
}

export async function deletePropertyDraft<T>(id: string) {
  write(readRaw<T>().filter((draft) => draft.id !== id));
  await deleteDraftMedia(id);
}

export async function saveDraftMedia(id: string, media: PropertyDraftMedia) {
  const db = await openMediaDb();
  await new Promise<void>((resolve, reject) => {
    const request = db
      .transaction(MEDIA_STORE, "readwrite")
      .objectStore(MEDIA_STORE)
      .put(media, mediaKey(id));
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}

export async function getDraftMedia(
  id: string,
): Promise<PropertyDraftMedia | null> {
  const db = await openMediaDb();
  const value = await new Promise<PropertyDraftMedia | null>(
    (resolve, reject) => {
      const request = db
        .transaction(MEDIA_STORE)
        .objectStore(MEDIA_STORE)
        .get(mediaKey(id));
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    },
  );
  db.close();
  return value;
}
