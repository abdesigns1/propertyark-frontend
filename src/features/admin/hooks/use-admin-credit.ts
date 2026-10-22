import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminCreditService,
  type AdminCreditGiftInput,
  type CreditPointSettings,
} from "@/services/admin-credit.service";
import { adminService } from "@/services/admin.service";
import {
  activityService,
  type AdminActivity,
} from "@/services/activity.service";

const settingsKey = ["admin", "credit-points", "settings"] as const;
const giftHistoryKey = ["admin", "credit-points", "gift-history"] as const;

type UnknownRecord = Record<string, unknown>;

export interface AdminCreditGiftHistoryItem {
  id: string;
  name: string;
  reason: string;
  points: number | null;
  recipientCount: number | null;
  recipientLabel: string;
  expiresAt: string | null;
  createdAt: string;
  giftedBy: string;
}

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function text(source: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function number(source: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = Number(source[key]);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function array(source: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    if (Array.isArray(source[key])) return source[key];
  }
  return [];
}

function isCreditGift(activity: AdminActivity) {
  const searchable = [
    activity.action,
    activity.entityType,
    activity.title,
    activity.description,
    JSON.stringify(activity.metadata),
  ]
    .join(" ")
    .toLowerCase();

  return (
    /gift/.test(searchable) && /(credit|point|wallet|bonus)/.test(searchable)
  );
}

function giftHistoryItem(activity: AdminActivity): AdminCreditGiftHistoryItem {
  const metadata = {
    ...activity.metadata,
    ...record(activity.metadata.gift),
    ...record(activity.metadata.creditGift),
  };
  const vendorIds = array(metadata, [
    "vendorIds",
    "vendor_ids",
    "recipientIds",
    "recipient_ids",
  ]);
  const recipients = array(metadata, ["vendors", "recipients", "users"]);
  const recipientCount =
    number(metadata, [
      "recipientCount",
      "recipient_count",
      "vendorCount",
      "vendor_count",
      "totalRecipients",
    ]) ??
    (vendorIds.length || recipients.length || null);
  const scope =
    text(metadata, ["scope", "recipientType", "recipient_type", "audience"]) ??
    "";
  const allVendors =
    metadata.allVendors === true ||
    metadata.all_vendors === true ||
    /all|every/.test(scope.toLowerCase()) ||
    /all|every/.test(`${activity.title} ${activity.description}`.toLowerCase());

  return {
    id: activity.id,
    name:
      text(metadata, ["name", "giftName", "gift_name", "title"]) ??
      activity.title,
    reason:
      text(metadata, ["reason", "description", "message"]) ??
      activity.description,
    points: number(metadata, [
      "points",
      "creditPoints",
      "credit_points",
      "pointsPerVendor",
      "points_per_vendor",
    ]),
    recipientCount,
    recipientLabel: allVendors
      ? recipientCount
        ? `All vendors (${recipientCount.toLocaleString("en-NG")})`
        : "All vendors"
      : recipientCount === 1
        ? "1 vendor"
        : recipientCount
          ? `${recipientCount.toLocaleString("en-NG")} vendors`
          : "Selected vendor(s)",
    expiresAt: text(metadata, [
      "expiresAt",
      "expires_at",
      "expiryDate",
      "expiry_date",
    ]),
    createdAt: activity.createdAt,
    giftedBy: activity.actor.name,
  };
}

export function useAdminCreditSettings() {
  return useQuery({
    queryKey: settingsKey,
    queryFn: adminCreditService.getSettings,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useUpdateAdminCreditSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: CreditPointSettings) =>
      adminCreditService.updateSettings(settings),
    onSuccess: (settings) => queryClient.setQueryData(settingsKey, settings),
  });
}

export function useAdminCreditVendors() {
  return useQuery({
    queryKey: ["admin", "credit-points", "vendors"],
    queryFn: async () => {
      const pageSize = 100;
      const firstPage = await adminService.getUsers(1, pageSize);
      const remainingPages = await Promise.all(
        Array.from(
          { length: Math.max(0, firstPage.pagination.pages - 1) },
          (_, index) => adminService.getUsers(index + 2, pageSize),
        ),
      );

      return [firstPage, ...remainingPages]
        .flatMap((page) => page.users)
        .filter((user) => user.role.toUpperCase() === "VENDOR")
        .sort((first, second) => first.fullName.localeCompare(second.fullName));
    },
    staleTime: 60_000,
    retry: 1,
  });
}

export function useAdminCreditGiftHistory() {
  return useQuery({
    queryKey: giftHistoryKey,
    queryFn: async () => {
      const limit = 100;
      const firstPage = await activityService.getAll({ page: 1, limit });
      const remainingPages = await Promise.all(
        Array.from(
          { length: Math.max(0, firstPage.pagination.pages - 1) },
          (_, index) => activityService.getAll({ page: index + 2, limit }),
        ),
      );

      return [firstPage, ...remainingPages]
        .flatMap((page) => page.activities)
        .filter(isCreditGift)
        .map(giftHistoryItem)
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime(),
        );
    },
    staleTime: 30_000,
    retry: 1,
  });
}

export function useGiftAdminCreditPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gift: AdminCreditGiftInput) =>
      adminCreditService.giftPoints(gift),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "credit-points"] }),
        queryClient.invalidateQueries({ queryKey: ["vendor-credit-points"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "activities"] }),
      ]);
    },
  });
}
