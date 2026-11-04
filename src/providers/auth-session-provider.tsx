"use client";

import { useEffect } from "react";
import {
  restoreAuthSession,
  useAuthSessionReady,
} from "@/hooks/use-auth-session-ready";
import { activateAuthSessionChannel } from "@/services/auth-session-channel";
import { AUTH_STORAGE_KEY, useAuthStore } from "@/store/auth.store";

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthSessionReady();

  useEffect(() => {
    activateAuthSessionChannel();

    async function synchronizeSession(event: StorageEvent) {
      if (event.key !== AUTH_STORAGE_KEY) return;

      const previous = useAuthStore.getState();
      await useAuthStore.persist.rehydrate();
      const state = useAuthStore.getState();
      const accountChanged =
        previous.isAuthenticated !== state.isAuthenticated ||
        previous.userId !== state.userId ||
        previous.role !== state.role;

      // Profile edits for the same account do not invalidate this tab's token.
      if (!accountChanged) return;

      // A token belongs to the account that was active in this tab. When
      // another tab logs in or out, discard it before syncing the new state.
      state.setAccessToken(null);
      if (!useAuthStore.getState().isAuthenticated) return;

      try {
        await restoreAuthSession();
      } catch {
        // Keep the failure local. Clearing the persisted account here would
        // turn one tab's restoration failure into a logout in every tab.
      }
    }

    window.addEventListener("storage", synchronizeSession);
    return () => window.removeEventListener("storage", synchronizeSession);
  }, []);

  return children;
}
