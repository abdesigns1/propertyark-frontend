import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_PREFIXES = {
  buyer: "/buyer",
  vendor: "/vendor",
  admin: "/admin",
} as const;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicAdminRoutes = [
    "/admin/login",
    "/admin/request-access",
    "/admin/setup",
    "/admin/redirecting",
    "/admin/dashboard",
  ];
  const clientGuardedAdminPrefixes = [
    "/admin/users",
    "/admin/properties",
    "/admin/kyc",
    "/admin/notifications",
  ];

  if (
    publicAdminRoutes.some((route) => pathname === route) ||
    clientGuardedAdminPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return NextResponse.next();
  }
  const session = request.cookies.get("session")?.value;
  const cookieRole = request.cookies.get("role")?.value.toLowerCase();
  const role = cookieRole === "user" ? "buyer" : cookieRole;

  const matchedRole = (
    Object.keys(ROLE_PREFIXES) as Array<keyof typeof ROLE_PREFIXES>
  ).find((r) => pathname.startsWith(ROLE_PREFIXES[r]));

  if (matchedRole) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role && role !== matchedRole) {
      return NextResponse.redirect(
        new URL(
          `${ROLE_PREFIXES[role as keyof typeof ROLE_PREFIXES] ?? "/"}/dashboard`,
          request.url,
        ),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Admin authentication currently lives in the client-side Zustand store as
  // a bearer token, which Proxy cannot read. Public admin routes are therefore
  // guarded in their client components until the backend exposes a
  // server-readable session-cookie contract. Protected API endpoints continue
  // enforcing role authorization.
  matcher: ["/admin/:path*"],
};
