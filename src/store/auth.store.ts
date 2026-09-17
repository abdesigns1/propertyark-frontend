import { create } from "zustand";
import { persist } from "zustand/middleware";

const ACCESS_TOKEN_SESSION_KEY = "propertyark-access-token";

function readSessionAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage.getItem(ACCESS_TOKEN_SESSION_KEY);
  } catch {
    return null;
  }
}

function writeSessionAccessToken(accessToken: string | null) {
  if (typeof window === "undefined") return;

  try {
    if (accessToken) {
      window.sessionStorage.setItem(ACCESS_TOKEN_SESSION_KEY, accessToken);
    } else {
      window.sessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY);
    }
  } catch {
    // Continue with the in-memory session when storage is unavailable.
  }
}

export type Role = "buyer" | "vendor" | "admin" | "staff" | "user";

export interface AuthUser {
  id: string | null;
  fullName: string;
  email: string | null;
  avatarUrl: string | null;
  phone?: string | null;
  location?: string | null;
}

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  role: Role | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (payload: {
    accessToken?: string | null;
    userId?: string | null;
    role: Role;
    user?: AuthUser | null;
  }) => void;
  setAccessToken: (accessToken: string) => void;
  updateUser: (payload: Partial<AuthUser>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: readSessionAccessToken(),
      userId: null,
      role: null,
      user: null,
      isAuthenticated: false,
      setAuth: ({ accessToken = null, userId = null, role, user }) => {
        writeSessionAccessToken(accessToken);
        set((state) => ({
          accessToken,
          userId,
          role,
          user: user === undefined ? state.user : user,
          isAuthenticated: true,
        }));
      },
      setAccessToken: (accessToken) => {
        writeSessionAccessToken(accessToken);
        set({ accessToken });
      },
      updateUser: (payload) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...payload } : state.user,
        })),
      clearAuth: () => {
        writeSessionAccessToken(null);
        set({
          accessToken: null,
          userId: null,
          role: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "propertyark-auth-session",
      version: 2,
      /*
       * Persist only non-secret session metadata in localStorage. The access
       * token is kept in tab-scoped sessionStorage so reloads do not discard
       * an active login. The secure refresh cookie still renews expired tokens.
       *
       * Version 2 intentionally invalidates the previous persisted shape so a
       * bearer token written by an older deployment is removed on hydration.
       */
      partialize: (state) => ({
        userId: state.userId,
        role: state.role,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState as AuthState;
        }

        const safeState = { ...(persistedState as Partial<AuthState>) };
        delete safeState.accessToken;
        return safeState as AuthState;
      },
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<AuthState>),
        accessToken: currentState.accessToken,
      }),
    },
  ),
);
