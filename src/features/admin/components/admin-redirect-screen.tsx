"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyArkMark } from "@/components/admin/propertyark-mark";
import { useAuthStore } from "@/store/auth.store";

export function AdminRedirectScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    const destination =
      isAuthenticated && (role === "admin" || role === "staff")
        ? "/admin/dashboard"
        : "/admin/login";
    const timer = window.setTimeout(() => router.replace(destination), 1200);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated, role, router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navbar px-5 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary),transparent_42%)] opacity-40" />
      <Card className="relative w-full max-w-md border-white/15 bg-white/95 shadow-2xl">
        <CardContent className="flex flex-col items-center gap-6 px-7 py-10 text-center sm:px-10">
          <PropertyArkMark />
          <span className="relative flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-9" />
            <CheckCircle2 className="absolute -bottom-1 -right-1 size-7 rounded-full bg-background text-success" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Login successful
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your administrative access has been verified. We’re preparing your
              secure workspace.
            </p>
          </div>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <LoaderCircle className="animate-spin" />
            Redirecting to admin dashboard…
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
