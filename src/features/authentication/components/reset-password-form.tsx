"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, CircleCheck, ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TextField } from "@/features/authentication/components/text-field";
import { useResetPassword } from "@/features/authentication/hooks/use-login";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/features/authentication/validation/reset-password.schema";
import { getApiErrorMessage } from "@/services/api-error";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";
  const token = searchParams.get("token")?.trim() ?? "";
  // Token formats are owned by the backend and may change. The client only
  // checks that the reset credentials exist; the API remains responsible for
  // validating expiry, integrity, and whether the token has already been used.
  const hasValidResetLink = isValidEmail(email) && token.length > 0;
  const [isComplete, setIsComplete] = useState(false);
  const resetPassword = useResetPassword();
  const { control, handleSubmit } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (!hasValidResetLink) {
    return (
      <div className="flex w-full max-w-md flex-col gap-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <CircleAlert aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Reset link unavailable
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            This password-reset link is incomplete or invalid. Request a new
            link to continue.
          </p>
        </div>
        <Button asChild className="h-12">
          <Link href="/forgot-password">Request a new reset link</Link>
        </Button>
        <Button asChild variant="outline" className="h-12">
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex w-full max-w-md flex-col gap-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CircleCheck aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Password updated
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your password has been reset successfully. You can now sign in with
            your new password.
          </p>
        </div>
        <Button asChild className="h-12">
          <Link href="/login">Continue to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col">
      <Link
        href="/login"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Back to login
      </Link>

      <div className="mt-12">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Create a new password
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Choose a secure password with at least eight characters for {email}.
        </p>
      </div>

      <form
        className="mt-8 flex flex-col gap-5"
        onSubmit={handleSubmit((values) =>
          resetPassword.mutate(
            { email, token, password: values.password },
            {
              onSuccess: () => {
                window.history.replaceState(null, "", "/reset-password");
                setIsComplete(true);
                toast.success("Your password has been updated.");
              },
              onError: (error) =>
                toast.error(
                  getApiErrorMessage(
                    error,
                    "Unable to reset your password. The link may have expired.",
                  ),
                ),
            },
          ),
        )}
      >
        <TextField
          control={control}
          name="password"
          label="New password"
          placeholder="Enter your new password"
          type="password"
          autoComplete="new-password"
        />
        <TextField
          control={control}
          name="confirmPassword"
          label="Confirm new password"
          placeholder="Enter your new password again"
          type="password"
          autoComplete="new-password"
        />
        <Button
          type="submit"
          disabled={resetPassword.isPending}
          className="h-12"
        >
          {resetPassword.isPending && <Spinner data-icon="inline-start" />}
          {resetPassword.isPending ? "Updating password..." : "Reset password"}
        </Button>
      </form>
    </div>
  );
}
