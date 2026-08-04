import axios from "axios";
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

function isUncertainInquiryDelivery(error: unknown) {
  if (!axios.isAxiosError(error)) return false;
  return !error.response || [502, 503, 504].includes(error.response.status);
}

async function findRecentlyCreatedInquiry(
  propertyId: string,
  requestedAfter: number,
) {
  const { data } = await api.get("/inquiries/my", {
    params: { page: 1, limit: 20 },
  });
  const inspections = inspectionRows(data).map(normalizeInspection);

  return inspections.find((inspection) => {
    const createdAt = new Date(inspection.requestSentAt).getTime();
    return (
      inspection.propertyId === propertyId &&
      Number.isFinite(createdAt) &&
      createdAt >= requestedAfter - 30_000
    );
  });
}

export const inspectionService = {
  async getBuyerInspections(): Promise<VendorInspectionsResult> {
    const { data } = await api.get("/inquiries/my", {
      params: { page: 1, limit: 100 },
    });
    const inspections = inspectionRows(data).map(normalizeInspection);
    return {
      inspections,
      stats: normalizeStats({}, inspections),
    };
  },
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
    const requestedAt = Date.now();
    const preferredSchedule = new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(`${input.date}T${input.time}`));
    const scheduleNote = `Preferred inspection time: ${preferredSchedule}.`;
    try {
      const { data } = await api.post("/inquiries", {
        propertyId: input.propertyId,
        name: input.name,
        location: input.location,
        message: `${input.message.trim()} ${scheduleNote}`.trim(),
        meetingType: input.meetingType,
      });
      return data;
    } catch (error) {
      if (!isUncertainInquiryDelivery(error)) throw error;

      // A gateway timeout can occur after the backend commits the inquiry.
      // Confirm it through the buyer list before showing an error that would
      // encourage the user to submit the same request again.
      try {
        const inquiry = await findRecentlyCreatedInquiry(
          input.propertyId,
          requestedAt,
        );
        if (inquiry) return inquiry;
      } catch {
        // Preserve the original POST failure when confirmation is unavailable.
      }

      throw error;
    }
  },
};
