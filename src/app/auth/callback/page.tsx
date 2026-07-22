import { Suspense } from "react";
import { GoogleAuthCallback } from "@/features/authentication/components/google-auth-callback";

export default function GoogleAuthCallbackPage() {
  return (
    <Suspense>
      <GoogleAuthCallback />
    </Suspense>
  );
}
