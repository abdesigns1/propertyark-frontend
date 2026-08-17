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
  vendorName: string | null;
  vendorId: string | null;
  vendorEmail: string | null;
  vendorPhone: string | null;
  vendorAvatarUrl: string | null;
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
    if (
      typeof value === "string" &&
      value.trim() &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }
  return 0;
}

function preferredDateFromMessage(message: string | null) {
  if (!message) return null;
  const match = message.match(/Preferred inspection time:\s*([^.]*)\.?/i);
  if (!match?.[1]) return null;
  const parsed = new Date(match[1].trim());
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function inspectionRows(value: unknown) {
  if (Array.isArray(value)) return value;
  const source = unwrap(value);
  for (const key of [
    "inquiries",
    "inspections",
    "appointments",
    "items",
    "results",
  ]) {
    if (Array.isArray(source[key])) return source[key] as unknown[];
  }
  return [];
}

function normalizeInspection(value: unknown, index: number): VendorInspection {
  const inquiry = record(value);
  const user = record(
    inquiry.user ?? inquiry.buyer ?? inquiry.requester ?? inquiry.lead,
  );
  const property = record(inquiry.property);
  const vendor = record(
    inquiry.vendor ??
      inquiry.propertyVendor ??
      property.vendor ??
      property.owner,
  );
  const vendorProfile = record(
    vendor.profile ?? vendor.vendorProfile ?? vendor.business,
  );
  const schedule = record(
    inquiry.schedule ??
      inquiry.appointment ??
      inquiry.inspection ??
      inquiry.availability ??
      inquiry.slot,
  );
  const media = Array.isArray(property.media)
    ? property.media.map(record)
    : Array.isArray(property.images)
      ? property.images.map(record)
      : [];
  const primaryMedia =
    media.find((item) => item.isPrimary === true || item.isCover === true) ??
    media[0] ??
    {};
  const requestSentAt =
    stringFrom(inquiry, ["createdAt", "requestedAt", "submittedAt"]) ??
    new Date(0).toISOString();
  const message = stringFrom(inquiry, ["message", "notes"]);
  const date =
    stringFrom(inquiry, [
      "inspectionDate",
      "proposedInspectionDate",
      "proposedDate",
      "scheduledDate",
      "scheduledAt",
      "appointmentDate",
      "appointmentAt",
      "preferredDate",
      "preferredInspectionDate",
      "confirmedDate",
      "date",
    ]) ??
    stringFrom(schedule, [
      "inspectionDate",
      "proposedInspectionDate",
      "proposedDate",
      "scheduledDate",
      "scheduledAt",
      "appointmentDate",
      "appointmentAt",
      "startAt",
      "startDateTime",
      "date",
    ]) ??
    preferredDateFromMessage(message) ??
    "";
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
      stringFrom(inquiry, ["email", "userEmail"]) ??
      stringFrom(user, ["email"]),
    userPhone:
      stringFrom(inquiry, ["phone", "phoneNumber", "userPhone"]) ??
      stringFrom(user, ["phone", "phoneNumber"]),
    userAvatarUrl:
      stringFrom(inquiry, ["avatar", "avatarUrl"]) ??
      stringFrom(user, ["avatar", "avatarUrl", "profilePicture"]),
    propertyId:
      stringFrom(inquiry, ["propertyId"]) ??
      stringFrom(property, ["id", "_id"]),
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
    vendorName:
      stringFrom(inquiry, ["vendorName", "propertyVendorName"]) ??
      stringFrom(vendor, ["fullName", "name", "companyName", "businessName"]) ??
      stringFrom(vendorProfile, [
        "fullName",
        "name",
        "companyName",
        "businessName",
      ]),
    vendorId:
      stringFrom(inquiry, ["vendorId"]) ??
      stringFrom(vendor, ["id", "_id"]) ??
      stringFrom(property, ["vendorId"]),
    vendorEmail:
      stringFrom(inquiry, ["vendorEmail"]) ??
      stringFrom(vendor, ["email"]) ??
      stringFrom(vendorProfile, ["email"]),
    vendorPhone:
      stringFrom(inquiry, ["vendorPhone", "vendorPhoneNumber"]) ??
      stringFrom(vendor, ["phone", "phoneNumber"]) ??
      stringFrom(vendorProfile, ["phone", "phoneNumber"]),
    vendorAvatarUrl:
      stringFrom(inquiry, ["vendorAvatar", "vendorAvatarUrl"]) ??
      stringFrom(vendor, ["avatar", "avatarUrl", "profilePicture"]) ??
      stringFrom(vendorProfile, ["avatar", "avatarUrl", "profilePicture"]),
    inspectionDate: date,
    time:
      stringFrom(inquiry, [
        "time",
        "inspectionTime",
        "appointmentTime",
        "proposedTime",
      ]) ??
      stringFrom(schedule, [
        "time",
        "startTime",
        "inspectionTime",
        "proposedTime",
      ]),
    location:
      stringFrom(inquiry, ["location", "meetingLocation"]) ??
      (propertyLocation || "Location not provided"),
    status: (stringFrom(inquiry, ["status"]) ?? "PENDING").toUpperCase(),
    meetingType: stringFrom(inquiry, ["meetingType", "inspectionType"]),
    message,
    requestSentAt,
    updatedAt: stringFrom(inquiry, ["updatedAt", "reviewedAt", "approvedAt"]),
  };
}

function normalizeStats(
  value: unknown,
  inspections: VendorInspection[],
): VendorInspectionStats {
  const source = unwrap(value);
  const count = (...statuses: string[]) =>
    inspections.filter((inspection) => statuses.includes(inspection.status))
      .length;

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
    const inspections = inspectionRows(listResponse.data).map(
      normalizeInspection,
    );
    return {
      inspections,
      stats: normalizeStats(statsResponse.data, inspections),
    };
  },
  async getInspectionsForVendor({
    vendorId,
    email,
    propertyIds,
  }: {
    vendorId: string;
    email: string;
    propertyIds: string[];
  }): Promise<VendorInspection[]> {
    const { data } = await api.get("/inquiries/vendor", {
      params: { vendorId, page: 1, limit: 1000 },
    });
    const propertyIdSet = new Set(propertyIds);
    const normalizedEmail = email.trim().toLowerCase();

    return inspectionRows(data)
      .map(normalizeInspection)
      .filter(
        (inspection) =>
          (inspection.propertyId && propertyIdSet.has(inspection.propertyId)) ||
          inspection.vendorEmail?.trim().toLowerCase() === normalizedEmail ||
          inspection.vendorId === vendorId,
      );
  },
  async getInspectionsForUser({
    userId,
    email,
  }: {
    userId: string;
    email: string;
  }): Promise<VendorInspection[]> {
    const responses = await Promise.allSettled([
      // The general collection is the correct administrator view. Supplying
      // userId lets supporting API versions filter before returning records.
      api.get("/inquiries", {
        params: { userId, page: 1, limit: 1000 },
      }),
      // Keep compatibility with API versions that expose inquiry lists only
      // through the vendor collection, then enforce the user filter locally.
      api.get("/inquiries/vendor", {
        params: { page: 1, limit: 1000 },
      }),
    ]);
    const responsePayloads = responses.flatMap((response) =>
      response.status === "fulfilled" ? [response.value.data] : [],
    );

    if (!responsePayloads.length) {
      const rejection = responses.find(
        (response): response is PromiseRejectedResult =>
          response.status === "rejected",
      );
      throw rejection?.reason ?? new Error("Inspection records unavailable");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const uniqueInspections = new Map<string, VendorInspection>();

    responsePayloads.forEach((payload) => {
      inspectionRows(payload)
        .map(normalizeInspection)
        .forEach((inspection) =>
          uniqueInspections.set(inspection.id, inspection),
        );
    });

    return [...uniqueInspections.values()].filter(
      (inspection) =>
        inspection.userId === userId ||
        inspection.userEmail?.trim().toLowerCase() === normalizedEmail,
    );
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
    const payload = {
      status,
      ...(reason ? { reason } : {}),
    };

    try {
      // The current API collection documents this operation as GET with a
      // JSON body. Use request() so Axios preserves that documented body.
      const { data } = await api.request({
        method: "GET",
        url: `/inquiries/${inspectionId}/review`,
        data: payload,
      });
      return data;
    } catch (error) {
      if (
        !axios.isAxiosError(error) ||
        ![400, 404, 405].includes(error.response?.status ?? 0)
      ) {
        throw error;
      }

      // Keep compatibility with the previous API contract while deployments
      // transition to the newly documented review method.
      const { data } = await api.patch(
        `/inquiries/${inspectionId}/review`,
        payload,
      );
      return data;
    }
  },
  complete: async (inspectionId: string) => {
    const { data } = await api.patch(`/users/${inspectionId}/complete`);
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
        proposedDate: new Date(`${input.date}T${input.time}`).toISOString(),
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
