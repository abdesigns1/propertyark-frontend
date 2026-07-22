export type GoogleAuthRole = "USER" | "VENDOR";

export const GOOGLE_AUTH_REDIRECT_KEY = "propertyark-google-auth-redirect";

export function startGoogleAuth({
  role,
  redirectTo,
}: {
  role: GoogleAuthRole;
  redirectTo?: string | null;
}) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error("Google authentication is not configured.");
  }

  if (redirectTo?.startsWith("/") && !redirectTo.startsWith("//")) {
    window.sessionStorage.setItem(GOOGLE_AUTH_REDIRECT_KEY, redirectTo);
  } else {
    window.sessionStorage.removeItem(GOOGLE_AUTH_REDIRECT_KEY);
  }

  const googleAuthUrl = new URL(`${apiBaseUrl.replace(/\/$/, "")}/auth/google`);
  googleAuthUrl.searchParams.set("role", role);
  window.location.assign(googleAuthUrl.toString());
}
