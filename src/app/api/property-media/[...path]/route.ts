import type { NextRequest } from "next/server";
import {
  isAllowedMediaContentType,
  sanitizeMediaPath,
  secureMediaHeaders,
} from "@/lib/property-media-security";

const MEDIA_ORIGIN = "https://propertyark-backend.onrender.com";

/**
 * Streams PropertyArk uploads through the frontend origin. The backend marks
 * upload responses as same-origin, which prevents browsers from embedding the
 * files directly on the frontend domain.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const safePath = sanitizeMediaPath(path);
  if (!safePath) {
    return Response.json(
      { message: "A valid media path is required." },
      { status: 400 },
    );
  }

  const upstreamUrl = new URL(`/uploads/${safePath.join("/")}`, MEDIA_ORIGIN);

  try {
    const requestHeaders = new Headers();
    const range = request.headers.get("range");
    if (range) requestHeaders.set("range", range);

    const response = await fetch(upstreamUrl, {
      headers: requestHeaders,
      cache: "no-store",
      redirect: "error",
    });
    if (!response.ok) {
      return Response.json(
        { message: "Property media could not be loaded." },
        { status: response.status },
      );
    }

    if (
      !isAllowedMediaContentType(
        response.headers.get("content-type"),
        "property",
      )
    ) {
      return Response.json(
        { message: "The upstream response is not a supported media type." },
        { status: 415 },
      );
    }

    const headers = secureMediaHeaders(response.headers, "property");

    return new Response(response.body, { status: response.status, headers });
  } catch {
    return Response.json(
      { message: "Property media is temporarily unavailable." },
      { status: 502 },
    );
  }
}
