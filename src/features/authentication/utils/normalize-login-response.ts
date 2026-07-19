import type { LoginResponse } from "@/services/auth.service";
import type { AuthUser, Role } from "@/store/auth.store";

function clean(value?: string) {
  return value?.trim() || undefined;
}

export function normalizeLoginResponse(response: LoginResponse) {
  const candidates = [
    response,
    response.data,
    response.result,
    response.data?.data,
    response.data?.result,
  ].filter((item): item is LoginResponse => Boolean(item));
  const data = candidates.find((item) => item.accessToken || item.token) ?? response;
  const backendUser = candidates.map((item) => item.user ?? item.profile).find(Boolean)
    ?? candidates.find((item) => item.fullName || item.name || item.email);
  const role = (backendUser?.role ?? candidates.find((item) => item.role)?.role ?? "user").toLowerCase() as Role;
  const userId = candidates.find((item) => item.userId)?.userId ?? backendUser?.id ?? backendUser?._id ?? null;
  const composedName = [
    clean(backendUser?.firstName),
    clean(backendUser?.lastName),
  ]
    .filter(Boolean)
    .join(" ");

  const hasProfile = Boolean(
    backendUser || candidates.some((item) => item.fullName || item.name || item.email),
  );
  const user: AuthUser | null = hasProfile
    ? {
        id: userId,
        fullName:
          clean(backendUser?.fullName) ??
          clean(backendUser?.name) ??
          clean(backendUser?.username) ??
          clean(candidates.find((item) => item.fullName)?.fullName) ??
          clean(candidates.find((item) => item.name)?.name) ??
          clean(composedName) ??
          "PropertyArk User",
        email: clean(backendUser?.email) ?? clean(candidates.find((item) => item.email)?.email) ?? null,
        avatarUrl:
          clean(backendUser?.avatar) ??
          clean(backendUser?.profilePicture) ??
          clean(candidates.find((item) => item.avatar)?.avatar) ??
          clean(candidates.find((item) => item.profilePicture)?.profilePicture) ??
          null,
        phone: clean(backendUser?.phone) ?? null,
        location: clean(backendUser?.location) ?? null,
      }
    : null;

  return {
    accessToken: data.accessToken ?? data.token ?? null,
    userId,
    role,
    user,
  };
}
