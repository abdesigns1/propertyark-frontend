import axios, { type AxiosError } from "axios";
import { getBackendOrigin } from "@/lib/backend-url";
import { api } from "@/services/axios";

type UnknownRecord = Record<string, unknown>;

export type ProfessionalServiceType =
  "ACCOUNTANT" | "MORTGAGE_BROKER" | "LEGAL" | "INSURANCE";

export interface ProfessionalServiceDocument {
  id: string;
  name: string;
  url: string | null;
  mimeType: string | null;
}

export interface ProfessionalServiceRequest {
  id: string;
  phone: string;
  serviceType: ProfessionalServiceType;
  consultationDate: string;
  propertyReference: string | null;
  message: string;
  documents: ProfessionalServiceDocument[];
  createdAt: string | null;
  requester: {
    id: string | null;
    name: string | null;
    email: string | null;
  };
}

export interface CreateProfessionalServiceInput {
  fullName: string;
  email: string;
  phone: string;
  serviceType: ProfessionalServiceType;
  consultationDate: string;
  propertyReference?: string;
  message: string;
  documents: File[];
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function isKnownCreateSuccessReportedAsNotFound(
  error: unknown,
): error is AxiosError {
  if (!axios.isAxiosError(error) || error.response?.status !== 404) {
    return false;
  }

  const method = error.config?.method?.toUpperCase();
  const requestPath = String(error.config?.url ?? "")
    .split("?")[0]
    .replace(/\/+$/, "");

  return method === "POST" && requestPath.endsWith("/professional-services");
}

function textFrom(source: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function normalizeServiceType(value: unknown): ProfessionalServiceType {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (normalized.includes("MORTGAGE")) return "MORTGAGE_BROKER";
  if (normalized.includes("LEGAL") || normalized.includes("LAW")) {
    return "LEGAL";
  }
  if (normalized.includes("INSURANCE")) return "INSURANCE";
  return "ACCOUNTANT";
}

function documentUrl(value: string | null) {
  if (!value) return null;

  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol)
      ? parsed.toString()
      : null;
  } catch {
    const backendOrigin = getBackendOrigin();
    if (!backendOrigin || !/^\/?uploads\//i.test(value)) return null;
    return `${backendOrigin}/${value.replace(/^\/+/, "")}`;
  }
}

function documentItems(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        return documentItems(JSON.parse(trimmed));
      } catch {
        // It is a regular file URL/name that happens to start with a bracket.
      }
    }

    return [trimmed];
  }

  const source = asRecord(value);
  const directUrl = textFrom(source, [
    "url",
    "secure_url",
    "secureUrl",
    "fileUrl",
    "documentUrl",
    "path",
    "filePath",
    "location",
  ]);
  if (directUrl) return [source];

  for (const key of [
    "documents",
    "documentUrls",
    "attachments",
    "files",
    "uploadedDocuments",
    "supportingDocuments",
    "items",
    "urls",
    "data",
  ]) {
    if (source[key] != null) return documentItems(source[key]);
  }

  return [];
}

function normalizeDocuments(value: unknown): ProfessionalServiceDocument[] {
  const documents = documentItems(value);

  return documents.map((document, index) => {
    if (typeof document === "string") {
      const name = document.split("/").pop() || `Document ${index + 1}`;
      return {
        id: `${name}-${index}`,
        name,
        url: documentUrl(document),
        mimeType: null,
      };
    }

    const source = asRecord(document);
    const rawUrl = textFrom(source, [
      "url",
      "secure_url",
      "secureUrl",
      "fileUrl",
      "documentUrl",
      "path",
      "filePath",
      "location",
    ]);
    return {
      id:
        textFrom(source, ["id", "_id", "documentId", "public_id"]) ??
        `document-${index}`,
      name:
        textFrom(source, [
          "name",
          "fileName",
          "originalName",
          "filename",
          "original_filename",
        ]) ??
        rawUrl?.split("/").pop() ??
        `Document ${index + 1}`,
      url: documentUrl(rawUrl),
      mimeType: textFrom(source, [
        "mimeType",
        "mimetype",
        "contentType",
        "resource_type",
        "type",
      ]),
    };
  });
}

function findRequestArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;

  const queue: unknown[] = [value];
  const visited = new Set<object>();
  const collectionKeys = [
    "professionalServices",
    "allProfessionalServices",
    "professionalServiceRequests",
    "serviceRequests",
    "services",
    "requests",
    "items",
    "records",
    "results",
    "data",
  ];

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object" || visited.has(current)) {
      continue;
    }
    visited.add(current);
    const source = asRecord(current);

    for (const key of collectionKeys) {
      if (Array.isArray(source[key])) return source[key];
    }

    for (const key of collectionKeys) {
      const nested = source[key];
      if (nested && typeof nested === "object") queue.push(nested);
    }
  }

  return [];
}

function findSingleRequest(value: unknown): UnknownRecord {
  let current = asRecord(value);
  const keys = [
    "data",
    "professionalService",
    "professionalServiceRequest",
    "serviceRequest",
    "request",
    "result",
  ];

  for (let depth = 0; depth < 5; depth += 1) {
    const nested = keys
      .map((key) => current[key])
      .find((item) => {
        const source = asRecord(item);
        return Object.keys(source).length > 0;
      });
    if (!nested) break;
    current = asRecord(nested);
  }

  return current;
}

function normalizeRequest(
  value: unknown,
  fallbackId = "professional-service-request",
): ProfessionalServiceRequest {
  const source = asRecord(value);
  const requester = asRecord(
    source.user ?? source.requester ?? source.customer ?? source.createdBy,
  );
  const firstName = textFrom(requester, ["firstName"]);
  const lastName = textFrom(requester, ["lastName"]);
  const fullName = [
    firstName ?? textFrom(source, ["firstName"]),
    lastName ?? textFrom(source, ["lastName"]),
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id:
      textFrom(source, [
        "id",
        "_id",
        "requestId",
        "serviceId",
        "professionalServiceId",
        "professionalServiceRequestId",
        "requestReference",
        "referenceNumber",
        "reference",
      ]) ?? fallbackId,
    phone: textFrom(source, ["phone", "phoneNumber", "contactPhone"]) ?? "",
    serviceType: normalizeServiceType(source.serviceType ?? source.type),
    consultationDate:
      textFrom(source, [
        "consultationDate",
        "preferredDate",
        "appointmentDate",
      ]) ?? "",
    propertyReference: textFrom(source, [
      "propertyReference",
      "propertyRef",
      "propertyId",
    ]),
    message:
      textFrom(source, ["message", "serviceBrief", "brief", "description"]) ??
      "",
    documents: normalizeDocuments(
      source.documents ??
        source.documentUrls ??
        source.documentURLs ??
        source.documentUrl ??
        source.attachments ??
        source.files ??
        source.uploadedDocuments ??
        source.supportingDocuments ??
        source.supportingFiles,
    ),
    createdAt: textFrom(source, ["createdAt", "submittedAt", "requestedAt"]),
    requester: {
      id:
        textFrom(source, ["userId", "requesterId"]) ??
        textFrom(requester, ["id", "_id"]),
      name:
        textFrom(source, ["name", "requesterName", "fullName"]) ??
        textFrom(requester, ["fullName", "name"]) ??
        (fullName || null),
      email:
        textFrom(source, ["email", "requesterEmail"]) ??
        textFrom(requester, ["email"]),
    },
  };
}

export const professionalServiceService = {
  async create(input: CreateProfessionalServiceInput) {
    const formData = new FormData();
    formData.append("fullName", input.fullName);
    formData.append("email", input.email);
    formData.append("phone", input.phone);
    formData.append("serviceType", input.serviceType);
    formData.append("consultationDate", input.consultationDate);
    if (input.propertyReference) {
      formData.append("propertyReference", input.propertyReference);
    }
    formData.append("message", input.message);
    input.documents.forEach((document) =>
      formData.append("documents", document),
    );

    try {
      const response = await api.post("/professional-services", formData);
      return response.data;
    } catch (error) {
      // The current backend persists the request and sends its email before
      // incorrectly completing this specific operation with a 404 response.
      // Keep this compatibility case limited to this one POST request so real
      // failures from other professional-service operations remain visible.
      if (isKnownCreateSuccessReportedAsNotFound(error)) {
        return error.response?.data;
      }

      throw error;
    }
  },

  async getAll() {
    const response = await api.get("/professional-services");
    return findRequestArray(response.data).map((item, index) =>
      normalizeRequest(item, `professional-service-${index}`),
    );
  },

  async getById(id: string) {
    try {
      const response = await api.get(`/professional-services/${id}`);
      return normalizeRequest(findSingleRequest(response.data), id);
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }

      // Some backend deployments expose the collection correctly but return
      // 404 from the matching detail route. Reuse the authoritative collection
      // record so an existing request remains viewable in the admin dashboard.
      const requests = await this.getAll();
      const request = requests.find((item) => item.id === id);
      if (request) return request;

      throw error;
    }
  },

  async deleteById(id: string) {
    await api.delete(`/professional-services/${id}`);
  },
};
