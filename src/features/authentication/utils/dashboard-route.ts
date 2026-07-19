import type { Role } from "@/store/auth.store";

export function getDashboardPath(role: Role | null) {
  switch (role) {
    case "user":
    case "buyer":
      return "/buyer/dashboard";
    case "vendor":
      return "/vendor/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/";
  }
}
