import { useAuthStore } from "@/store/auth.store";

function resolveAccountKey({
  role,
  userId,
  user,
}: Pick<ReturnType<typeof useAuthStore.getState>, "role" | "userId" | "user">) {
  const identity = userId ?? user?.id ?? user?.email ?? null;
  return identity ? `${role ?? "user"}:${identity}` : null;
}

export function useAccountKey() {
  return useAuthStore((state) => resolveAccountKey(state));
}

export function getCurrentAccountKey() {
  return resolveAccountKey(useAuthStore.getState());
}
