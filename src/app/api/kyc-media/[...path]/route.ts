import type { NextRequest } from "next/server";
import {
  isAllowedMediaContentType,
  sanitizeMediaPath,
  secureMediaHeaders,
} from "@/lib/property-media-security";

const MEDIA_ORIGIN = "https://propertyark-backend.onrender.com";

function roleFrom(value: unknown, depth = 0): string | null {
  if (!value || typeof value !== "object" || depth > 4) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.role === "string") return record.role.toUpperCase();
  for (const key of ["data", "user", "profile", "result"]) {
    const role = roleFrom(record[key], depth + 1);
    if (role) return role;
  }
  return null;
}

async function isAuthorizedReviewer(authorization: string, cookie: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) return false;

  try {
    const response = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/users/profile`,
      {
        headers: {
          authorization,
          ...(cookie ? { cookie } : {}),
        },
        cache: "no-store",
        redirect: "error",
      },
    );
    if (!response.ok) return false;
    return ["ADMIN", "STAFF"].includes(roleFrom(await response.json()) ?? "");
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const authorization = request.headers.get("authorization") ?? "";
  const cookie = request.headers.get("cookie") ?? "";
  if (!authorization || !(await isAuthorizedReviewer(authorization, cookie))) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }

  const safePath = sanitizeMediaPath((await params).path);
  if (!safePath) {
    return Response.json(
      { message: "A valid KYC document path is required." },
      { status: 400 },
    );
  }

  const upstreamUrl = new URL(`/uploads/${safePath.join("/")}`, MEDIA_ORIGIN);
  const requestHeaders = new Headers({ authorization });
  if (cookie) requestHeaders.set("cookie", cookie);
  const range = request.headers.get("range");
  if (range) requestHeaders.set("range", range);

  try {
    const response = await fetch(upstreamUrl, {
      headers: requestHeaders,
      cache: "no-store",
      redirect: "error",
    });
    if (!response.ok) {
      return Response.json(
        { message: "KYC document could not be loaded." },
        { status: response.status },
      );
    }
    if (
      !isAllowedMediaContentType(response.headers.get("content-type"), "kyc")
    ) {
      return Response.json(
        { message: "The KYC document type is not supported." },
        { status: 415 },
      );
    }

    return new Response(response.body, {
      status: response.status,
      headers: secureMediaHeaders(response.headers, "kyc"),
    });
  } catch {
    return Response.json(
      { message: "KYC document is temporarily unavailable." },
      { status: 502 },
    );
  }
}
