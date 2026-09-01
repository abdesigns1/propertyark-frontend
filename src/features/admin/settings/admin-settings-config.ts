import {
  BellRing,
  Building2,
  KeyRound,
  SlidersHorizontal,
  Store,
  UsersRound,
} from "lucide-react";

export const adminSettingsNavigation = [
  {
    label: "General",
    href: "/admin/settings",
    icon: SlidersHorizontal,
    external: false,
  },
  {
    label: "Notifications",
    href: "/admin/settings/notifications",
    icon: BellRing,
    external: false,
  },
  {
    label: "Security",
    href: "/admin/settings/security",
    icon: KeyRound,
    external: false,
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: UsersRound,
    external: true,
  },
  {
    label: "Vendor Management",
    href: "/admin/users",
    icon: Store,
    external: true,
  },
  {
    label: "Property Management",
    href: "/admin/properties",
    icon: Building2,
    external: true,
  },
] as const;
