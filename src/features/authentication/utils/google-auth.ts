export type GoogleAuthRole = "USER" | "VENDOR";

export const GOOGLE_AUTH_REDIRECT_KEY = "propertyark-google-auth-redirect";
export const GOOGLE_AUTH_ROLE_KEY = "propertyark-google-auth-role";
export const GOOGLE_AUTH_VENDOR_KYC_KEY = "propertyark-google-vendor-kyc";

export function startGoogleAuth({
  role,
  redirectTo,
  requireVendorKyc = false,
}: {
  role: GoogleAuthRole;
  redirectTo?: string | null;
  requireVendorKyc?: boolean;
}) {
  if (redirectTo?.startsWith("/") && !redirectTo.startsWith("//")) {
    window.sessionStorage.setItem(GOOGLE_AUTH_REDIRECT_KEY, redirectTo);
  } else {
    window.sessionStorage.removeItem(GOOGLE_AUTH_REDIRECT_KEY);
  }

  window.sessionStorage.setItem(GOOGLE_AUTH_ROLE_KEY, role);
  if (role === "VENDOR" && requireVendorKyc) {
    window.sessionStorage.setItem(GOOGLE_AUTH_VENDOR_KYC_KEY, "1");
  } else {
    window.sessionStorage.removeItem(GOOGLE_AUTH_VENDOR_KYC_KEY);
  }

  // Start OAuth through our same-origin route. It asks the backend for its
  // canonical Google authorization URL, then adds `prompt=select_account` so
  // Google does not silently reuse whichever account is already active.
  const googleAuthUrl = new URL(
    "/api/google-auth/start",
    window.location.origin,
  );
  googleAuthUrl.searchParams.set("role", role);
  window.location.assign(googleAuthUrl.toString());
}
