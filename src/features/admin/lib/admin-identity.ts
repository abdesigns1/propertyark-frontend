import type { AuthUser, Role } from "@/store/auth.store";

export function adminDisplayIdentity(user: AuthUser | null, role: Role | null) {
  const name =
    role === "staff"
      ? user?.fullName || "PropertyArk Staff"
      : "System Administrator";
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "PA";

  return {
    name,
    initials,
    roleLabel: role === "staff" ? "Staff" : "Super Admin",
  };
}
