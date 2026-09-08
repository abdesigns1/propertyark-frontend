"use client";

import { useCallback, useSyncExternalStore } from "react";

const SIDEBAR_STORAGE_EVENT = "propertyark:sidebar-preference";

export function useSidebarCollapse(storageKey: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === storageKey) onStoreChange();
      };
      window.addEventListener("storage", handleStorage);
      window.addEventListener(SIDEBAR_STORAGE_EVENT, onStoreChange);
      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(SIDEBAR_STORAGE_EVENT, onStoreChange);
      };
    },
    [storageKey],
  );
  const getSnapshot = useCallback(
    () => window.localStorage.getItem(storageKey) === "true",
    [storageKey],
  );
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, () => false);

  function updateCollapsed(value: boolean) {
    window.localStorage.setItem(storageKey, String(value));
    window.dispatchEvent(new Event(SIDEBAR_STORAGE_EVENT));
  }

  return [collapsed, updateCollapsed] as const;
}
