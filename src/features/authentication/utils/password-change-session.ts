import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { markSessionAsEnding } from "@/services/auth-session-lifecycle";
import { useAuthStore } from "@/store/auth.store";

const PASSWORD_CHANGED_NOTICE_KEY = "propertyark-password-changed-notice";
const LOGOUT_NOTICE_DURATION_MS = 2500;

function wait(duration: number) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

export async function finishPasswordChange({
  queryClient,
  loginPath,
}: {
  queryClient: QueryClient;
  loginPath: "/login" | "/admin/login";
}) {
  markSessionAsEnding();

  try {
    window.sessionStorage.setItem(PASSWORD_CHANGED_NOTICE_KEY, "true");
  } catch {
    // The redirect still succeeds when browser storage is unavailable.
  }

  await queryClient.cancelQueries();
  queryClient.clear();

  toast.success(
    "Password changed successfully. You will now be signed out so you can log in with your new password.",
    { duration: LOGOUT_NOTICE_DURATION_MS },
  );
  await wait(LOGOUT_NOTICE_DURATION_MS);

  try {
    // Use any server-side logout support that is currently available, while
    // still guaranteeing local logout if that endpoint fails.
    await authService.logout();
  } catch {
    // Backend-wide token revocation will be added separately.
  } finally {
    useAuthStore.getState().clearAuth();
    window.location.replace(loginPath);
  }
}

export function consumePasswordChangedNotice() {
  try {
    const shouldShow =
      window.sessionStorage.getItem(PASSWORD_CHANGED_NOTICE_KEY) === "true";
    if (shouldShow) {
      window.sessionStorage.removeItem(PASSWORD_CHANGED_NOTICE_KEY);
    }
    return shouldShow;
  } catch {
    return false;
  }
}
