"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TextField } from "@/features/authentication/components/text-field";
import { useForgotPassword } from "@/features/authentication/hooks/use-login";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/features/authentication/validation/forgot-password.schema";
import { getApiErrorMessage } from "@/services/api-error";

export function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const forgotPassword = useForgotPassword();
  const { control, handleSubmit } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  if (submittedEmail) {
    return (
      <div className="flex w-full max-w-md flex-col gap-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Check your email
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We sent password reset instructions to {submittedEmail}. Check your
            inbox and follow the link to continue.
          </p>
        </div>
        <Button asChild className="h-12">
          <Link href="/login">Back to login</Link>
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
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Enter the email address linked to your account and we will send you
          instructions to create a new password.
        </p>
      </div>

      <form
        className="mt-8 flex flex-col gap-5"
        onSubmit={handleSubmit((values) =>
          forgotPassword.mutate(values.email, {
            onSuccess: () => setSubmittedEmail(values.email),
            onError: (error) =>
              toast.error(
                getApiErrorMessage(
                  error,
                  "Unable to send password reset instructions.",
                ),
              ),
          }),
        )}
      >
        <TextField
          control={control}
          name="email"
          label="Email address"
          placeholder="Enter your email address"
          type="email"
        />
        <Button
          type="submit"
          disabled={forgotPassword.isPending}
          className="h-12"
        >
          {forgotPassword.isPending && <Spinner data-icon="inline-start" />}
          {forgotPassword.isPending ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </div>
  );
}
