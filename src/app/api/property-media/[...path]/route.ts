import type { NextRequest } from "next/server";

const MEDIA_ORIGIN = "https://propertyark-backend.onrender.com";

/**
 * Streams PropertyArk uploads through the frontend origin. The backend marks
 * upload responses as same-origin, which prevents browsers from embedding the
 * files directly on the frontend domain.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (!path.length) {
    return Response.json({ message: "Media path is required." }, { status: 400 });
  }

  const upstreamUrl = new URL(
    `/uploads/${path.map(encodeURIComponent).join("/")}`,
    MEDIA_ORIGIN,
  );

  try {
    const response = await fetch(upstreamUrl, { cache: "no-store" });
    if (!response.ok) {
      return Response.json(
        { message: "Property media could not be loaded." },
        { status: response.status },
      );
    }

    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");
    if (contentType) headers.set("content-type", contentType);
    if (contentLength) headers.set("content-length", contentLength);
    headers.set("cache-control", "public, max-age=3600");

    return new Response(response.body, { status: 200, headers });
  } catch {
    return Response.json(
      { message: "Property media is temporarily unavailable." },
      { status: 502 },
    );
  }
}
