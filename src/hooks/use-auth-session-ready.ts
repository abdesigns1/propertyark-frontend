"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

function accessTokenFrom(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const token = source.accessToken ?? source.token;
  if (typeof token === "string" && token.trim()) return token;
  return accessTokenFrom(source.data) ?? accessTokenFrom(source.result);
}

export function useAuthSessionReady() {
  const hydrated = useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [restoreAttempted, setRestoreAttempted] = useState(false);
  const needsRestore = hydrated && isAuthenticated && !accessToken;

  useEffect(() => {
    if (!needsRestore || restoreAttempted) return;

    let active = true;
    authService
      .refresh()
      .then((response) => {
        if (!active) return;
        const token = accessTokenFrom(response);
        if (!token)
          throw new Error("Refresh response did not include a token.");
        setAccessToken(token);
      })
      .catch(() => {
        if (active) clearAuth();
      })
      .finally(() => {
        if (active) setRestoreAttempted(true);
      });

    return () => {
      active = false;
    };
  }, [clearAuth, needsRestore, restoreAttempted, setAccessToken]);

  return hydrated && (!needsRestore || restoreAttempted);
}
