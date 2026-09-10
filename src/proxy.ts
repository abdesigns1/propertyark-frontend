import { NextResponse } from "next/server";

export function proxy() {
  // The access token is held in client memory, so Proxy cannot reliably decide
  // whether an administrator is authenticated.
  // Every admin route is allowed to render and the shared AdminWorkspace guard
  // keeps unauthenticated visitors inside the admin authentication flow. This
  // automatically covers future /admin pages without maintaining an allow-list.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
