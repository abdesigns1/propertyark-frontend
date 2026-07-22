import { api } from "@/services/axios";

export interface VendorSettingsProfile {
  id: string | null;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl: string | null;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeProfile(value: unknown): VendorSettingsProfile {
  const root = record(value);
  const data = record(root.data);
  const nested = record(data.user ?? data.profile);
  const source = Object.keys(nested).length
    ? nested
    : Object.keys(data).length
      ? data
      : root;
  const text = (...keys: string[]) =>
    keys.map((key) => source[key]).find((item) => typeof item === "string") as
      | string
      | undefined;
  return {
    id: text("id", "_id", "userId") ?? null,
    fullName: text("fullName", "name") ?? "",
    email: text("email") ?? "",
    phone: text("phone") ?? "",
    location: text("location", "address") ?? "",
    avatarUrl: text("avatarUrl", "avatar", "profilePicture") ?? null,
  };
}

export const settingsService = {
  getProfile: async () =>
    normalizeProfile((await api.get("/users/profile")).data),
  updateProfile: async (payload: {
    fullName: string;
    phone: string;
    location: string;
  }) => normalizeProfile((await api.patch("/users/update", payload)).data),
  updateAvatar: async (avatar: File) => {
    const form = new FormData();
    form.append("avatar", avatar);
    return normalizeProfile((await api.patch("/users/avatar", form)).data);
  },
  changePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => (await api.patch("/users/change-password", payload)).data,
};
