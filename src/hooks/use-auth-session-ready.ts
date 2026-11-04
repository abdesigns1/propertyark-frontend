"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { authService } from "@/services/auth.service";
import { settingsService } from "@/services/settings.service";
import { useAuthStore, type Role } from "@/store/auth.store";

function accessTokenFrom(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const token = source.accessToken ?? source.token;
  if (typeof token === "string" && token.trim()) return token;
  return accessTokenFrom(source.data) ?? accessTokenFrom(source.result);
}

function profileRole(value: string): Role | null {
  const role = value.trim().toLowerCase();
  if (
    role === "user" ||
    role === "buyer" ||
    role === "vendor" ||
    role === "admin" ||
    role === "staff"
  ) {
    return role;
  }
  return null;
}

let sessionRestorePromise: Promise<void> | null = null;

/**
 * Gives every browser tab its own access token using the shared secure refresh
 * cookie. The bearer token remains in sessionStorage and is never copied into
 * localStorage just to make cross-tab authentication work.
 */
export function restoreAuthSession() {
  if (sessionRestorePromise) return sessionRestorePromise;

  sessionRestorePromise = (async () => {
    const response = await authService.refresh();
    const accessToken = accessTokenFrom(response);
    if (!accessToken) {
      throw new Error("Refresh response did not include a token.");
    }

    const current = useAuthStore.getState();

    // Same-origin tabs normally share the non-secret profile metadata. If it
    // is unavailable, rebuild it from the authenticated profile endpoint.
    if (current.isAuthenticated && current.role) {
      current.setAccessToken(accessToken);
      return;
    }

    const profile =
      await settingsService.getProfileWithAccessToken(accessToken);
    const role = profileRole(profile.role);
    if (!role) throw new Error("The restored session has an invalid role.");

    const existingUser = useAuthStore.getState().user;
    useAuthStore.getState().setAuth({
      accessToken,
      userId: profile.id,
      role,
      user: {
        id: profile.id,
        fullName:
          profile.fullName || existingUser?.fullName || "PropertyArk User",
        email: profile.email || existingUser?.email || null,
        avatarUrl: profile.avatarUrl ?? existingUser?.avatarUrl ?? null,
        phone: profile.phone || existingUser?.phone || null,
        location: profile.location || existingUser?.location || null,
      },
    });
  })().finally(() => {
    sessionRestorePromise = null;
  });

  return sessionRestorePromise;
}

export function useAuthSessionReady() {
  const hydrated = useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [restoreAttempted, setRestoreAttempted] = useState(false);
  const needsRestore = hydrated && !accessToken;

  useEffect(() => {
    if (!needsRestore || restoreAttempted) return;

    let active = true;
    restoreAuthSession()
      .catch(() => {
        if (active) clearAuth();
      })
      .finally(() => {
        if (active) setRestoreAttempted(true);
      });

    return () => {
      active = false;
    };
  }, [clearAuth, needsRestore, restoreAttempted]);

  return hydrated && (!needsRestore || restoreAttempted);
}
