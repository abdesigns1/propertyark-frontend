import { api } from "@/services/axios";

type UnknownRecord = Record<string, unknown>;

export interface VendorInspection {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string | null;
  userPhone: string | null;
  userAvatarUrl: string | null;
  propertyId: string | null;
  propertyName: string;
  propertyReference: string | null;
  propertyImageUrl: string | null;
  inspectionDate: string;
  time: string | null;
  location: string;
  status: string;
  meetingType: string | null;
  message: string | null;
  requestSentAt: string;
  updatedAt: string | null;
}

export interface VendorInspectionStats {
  upcoming: number;
  pending: number;
  completed: number;
  declined: number;
}

export interface VendorInspectionsResult {
  inspections: VendorInspection[];
  stats: VendorInspectionStats;
}

export interface ScheduleInspectionInput {
  propertyId: string;
  buyerId: string | null;
  name: string;
  location: string;
  message: string;
  meetingType: "IN_PERSON" | "VIDEO_CALL";
  date: string;
  time: string;
}

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function unwrap(value: unknown) {
  const root = record(value);
  const data = record(root.data);
  return Object.keys(data).length ? data : root;
}

function stringFrom(source: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function numberFrom(source: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return 0;
}

function inspectionRows(value: unknown) {
  if (Array.isArray(value)) return value;
  const source = unwrap(value);
  for (const key of ["inquiries", "inspections", "appointments", "items", "results"]) {
    if (Array.isArray(source[key])) return source[key] as unknown[];
  }
  return [];
}

function normalizeInspection(value: unknown, index: number): VendorInspection {
  const inquiry = record(value);
  const user = record(inquiry.user ?? inquiry.buyer ?? inquiry.requester ?? inquiry.lead);
  const property = record(inquiry.property);
  const media = Array.isArray(property.media)
    ? property.media.map(record)
    : Array.isArray(property.images)
      ? property.images.map(record)
      : [];
  const primaryMedia =
    media.find((item) => item.isPrimary === true || item.isCover === true) ?? media[0] ?? {};
  const requestSentAt =
    stringFrom(inquiry, ["createdAt", "requestedAt", "submittedAt"]) ??
    new Date(0).toISOString();
  const date =
    stringFrom(inquiry, [
      "inspectionDate",
      "scheduledDate",
      "appointmentDate",
      "preferredDate",
      "createdAt",
    ]) ?? new Date(0).toISOString();
  const propertyLocation = [
    stringFrom(property, ["address"]),
    stringFrom(property, ["city"]),
  ]
    .filter(Boolean)
    .join(", ");

  return {
    id: stringFrom(inquiry, ["id", "_id"]) ?? `inspection-${index}`,
    userId:
      stringFrom(inquiry, ["userId", "buyerId"]) ??
      stringFrom(user, ["id", "_id"]),
    userName:
      stringFrom(inquiry, ["name", "fullName", "userName"]) ??
      stringFrom(user, ["fullName", "name"]) ??
      "PropertyArk user",
    userEmail:
      stringFrom(inquiry, ["email", "userEmail"]) ?? stringFrom(user, ["email"]),
    userPhone:
      stringFrom(inquiry, ["phone", "phoneNumber", "userPhone"]) ??
      stringFrom(user, ["phone", "phoneNumber"]),
    userAvatarUrl:
      stringFrom(inquiry, ["avatar", "avatarUrl"]) ??
      stringFrom(user, ["avatar", "avatarUrl", "profilePicture"]),
    propertyId:
      stringFrom(inquiry, ["propertyId"]) ?? stringFrom(property, ["id", "_id"]),
    propertyName:
      stringFrom(inquiry, ["propertyName", "propertyTitle"]) ??
      stringFrom(property, ["name", "title"]) ??
      "Property inspection",
    propertyReference:
      stringFrom(inquiry, ["reference", "propertyReference"]) ??
      stringFrom(property, ["reference", "referenceNumber", "code"]),
    propertyImageUrl:
      stringFrom(inquiry, ["propertyImage", "propertyImageUrl"]) ??
      stringFrom(property, ["image", "imageUrl", "thumbnail", "coverImage"]) ??
      stringFrom(primaryMedia, ["url", "imageUrl", "secureUrl"]),
    inspectionDate: date,
    time: stringFrom(inquiry, ["time", "inspectionTime", "appointmentTime"]),
    location:
      stringFrom(inquiry, ["location", "meetingLocation"]) ??
      (propertyLocation || "Location not provided"),
    status: (stringFrom(inquiry, ["status"]) ?? "PENDING").toUpperCase(),
    meetingType: stringFrom(inquiry, ["meetingType", "inspectionType"]),
    message: stringFrom(inquiry, ["message", "notes"]),
    requestSentAt,
    updatedAt: stringFrom(inquiry, ["updatedAt", "reviewedAt", "approvedAt"]),
  };
}

function normalizeStats(value: unknown, inspections: VendorInspection[]): VendorInspectionStats {
  const source = unwrap(value);
  const count = (...statuses: string[]) =>
    inspections.filter((inspection) => statuses.includes(inspection.status)).length;

  return {
    upcoming:
      numberFrom(source, ["upcoming", "accepted", "confirmed", "ACCEPTED"]) ||
      count("ACCEPTED", "CONFIRMED", "SCHEDULED"),
    pending:
      numberFrom(source, ["pending", "pendingInquiries", "PENDING"]) ||
      count("PENDING"),
    completed:
      numberFrom(source, ["completed", "completedVisits", "COMPLETED"]) ||
      count("COMPLETED"),
    declined:
      numberFrom(source, ["declined", "cancelled", "DECLINED", "CANCELLED"]) ||
      count("DECLINED", "REJECTED", "CANCELLED"),
  };
}

export const inspectionService = {
  async getVendorInspections(): Promise<VendorInspectionsResult> {
    const [listResponse, statsResponse] = await Promise.all([
      api.get("/inquiries/vendor", { params: { page: 1, limit: 100 } }),
      api.get("/inquiries/vendor/stats"),
    ]);
    const inspections = inspectionRows(listResponse.data).map(normalizeInspection);
    return {
      inspections,
      stats: normalizeStats(statsResponse.data, inspections),
    };
  },
  review: async ({
    inspectionId,
    status,
    reason,
  }: {
    inspectionId: string;
    status: "ACCEPTED" | "DECLINED";
    reason?: string;
  }) => {
    const { data } = await api.patch(`/inquiries/${inspectionId}/review`, {
      status,
      ...(reason ? { reason } : {}),
    });
    return data;
  },
  schedule: async (input: ScheduleInspectionInput) => {
    const scheduledAt = new Date(`${input.date}T${input.time}`).toISOString();
    const { data } = await api.post("/inquiries", {
      propertyId: input.propertyId,
      buyerId: input.buyerId ?? undefined,
      name: input.name,
      location: input.location,
      message: input.message,
      meetingType: input.meetingType,
      inspectionDate: scheduledAt,
      scheduledDate: scheduledAt,
      time: input.time,
    });
    return data;
  },
};
