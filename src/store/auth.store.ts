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
      version: 1,
      /*
       * Temporary development session persistence.
       *
       * This keeps authentication stable across Next.js development reloads and
       * browser refreshes. Replace this with HTTP-only refresh-cookie hydration
       * before production so the access token is no longer stored in localStorage.
       */
      partialize: (state) => ({
        accessToken: state.accessToken,
        userId: state.userId,
        role: state.role,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
