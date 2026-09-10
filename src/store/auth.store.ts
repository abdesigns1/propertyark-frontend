import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      accessToken: null,
      userId: null,
      role: null,
      user: null,
      isAuthenticated: false,
      setAuth: ({ accessToken = null, userId = null, role, user }) =>
        set((state) => ({
          accessToken,
          userId,
          role,
          user: user === undefined ? state.user : user,
          isAuthenticated: true,
        })),
      setAccessToken: (accessToken) => set({ accessToken }),
      updateUser: (payload) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...payload } : state.user,
        })),
      clearAuth: () =>
        set({
          accessToken: null,
          userId: null,
          role: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "propertyark-auth-session",
      version: 2,
      /*
       * Persist only non-secret session metadata. Access tokens remain in
       * memory and are restored through the secure refresh-cookie flow.
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

        const safeState = {
          ...(persistedState as Partial<AuthState>),
          accessToken: null,
        };
        return safeState as AuthState;
      },
    },
  ),
);
