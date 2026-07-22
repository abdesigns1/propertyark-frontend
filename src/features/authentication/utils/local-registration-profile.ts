import type { AuthUser } from "@/store/auth.store";

const KEY = "propertyark-registration-profiles";

function readProfiles(): Record<string, AuthUser> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Record<
      string,
      AuthUser
    >;
  } catch {
    return {};
  }
}

export function saveLocalRegistrationProfile(profile: AuthUser) {
  if (!profile.email || typeof window === "undefined") return;
  const profiles = readProfiles();
  profiles[profile.email.toLowerCase()] = profile;
  window.localStorage.setItem(KEY, JSON.stringify(profiles));
}

export function getLocalRegistrationProfile(email: string) {
  return readProfiles()[email.toLowerCase()] ?? null;
}
