"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/services/api-error";
import { normalizeLoginResponse } from "@/features/authentication/utils/normalize-login-response";
import { useAuthStore } from "@/store/auth.store";
import {
  adminLoginSchema,
  type AdminLoginValues,
} from "@/features/admin/validation/admin.schema";

export function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  async function onSubmit(values: AdminLoginValues) {
    setPending(true);
    try {
      const response = await authService.login(values);
      const auth = normalizeLoginResponse(response);
      if (auth.role !== "admin" && auth.role !== "staff") {
        throw new Error("This account does not have administrative access.");
      }
      setAuth(auth);
      toast.success("Welcome to the admin portal");
      router.replace("/admin/redirecting");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          error instanceof Error ? error.message : "Unable to sign in.",
        ),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full border-white/45 bg-white/35 py-0 shadow-2xl ring-1 ring-white/30 backdrop-blur-2xl">
      <CardContent className="p-7 sm:p-10">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="admin-email" className="sr-only">
                Work email
              </FieldLabel>
              <Input
                id="admin-email"
                type="email"
                placeholder="Work email"
                autoComplete="username"
                aria-invalid={Boolean(errors.email)}
                className="h-12 border-white/35 bg-white/90 shadow-sm"
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="admin-password" className="sr-only">
                Password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  className="h-12 border-white/35 bg-white/90 pr-12 shadow-sm"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <FieldError errors={[errors.password]} />
            </Field>
            <div className="flex items-center justify-between gap-4 text-sm text-white/85">
              <Controller
                control={control}
                name="rememberMe"
                render={({ field }) => (
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    Remember me
                  </label>
                )}
              />
              <Link href="/contact" className="hover:text-primary">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" disabled={pending} className="h-12">
              {pending ? "Signing in…" : "Sign In"}
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-6 text-center text-sm text-white/85">
          New staff?{" "}
          <Link
            href="/admin/request-access"
            className="font-semibold text-white underline underline-offset-4"
          >
            Request access
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
