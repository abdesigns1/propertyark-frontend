import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const GOOGLE_ACCOUNTS_HOST = "accounts.google.com";

function loginErrorRedirect(request: NextRequest) {
  const loginUrl = new URL("/login", request.nextUrl.origin);
  loginUrl.searchParams.set("error", "google_auth_unavailable");
  return NextResponse.redirect(loginUrl, 302);
}

export async function GET(request: NextRequest) {
  const requestedRole = request.nextUrl.searchParams.get("role")?.toUpperCase();
  const role = requestedRole === "VENDOR" ? "VENDOR" : "USER";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

  if (!apiBaseUrl) return loginErrorRedirect(request);

  try {
    const backendAuthUrl = new URL(`${apiBaseUrl}/auth/google`);
    backendAuthUrl.searchParams.set("role", role);

    const response = await fetch(backendAuthUrl, {
      cache: "no-store",
      redirect: "manual",
    });
    const location = response.headers.get("location");

    if (!location || response.status < 300 || response.status >= 400) {
      return loginErrorRedirect(request);
    }

    const googleAuthUrl = new URL(location, backendAuthUrl);
    if (googleAuthUrl.hostname !== GOOGLE_ACCOUNTS_HOST) {
      return loginErrorRedirect(request);
    }

    googleAuthUrl.searchParams.set("prompt", "select_account");
    return NextResponse.redirect(googleAuthUrl, 302);
  } catch {
    return loginErrorRedirect(request);
  }
}
