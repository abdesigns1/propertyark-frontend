"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TextField } from "./text-field";
import {
  verifySchema,
  type VerifyValues,
} from "@/features/authentication/validation/verify.schema";
import {
  useResendVerification,
  useVerifyAccount,
} from "@/features/authentication/hooks/use-verification";
import { getApiErrorMessage } from "@/services/api-error";

export function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verify = useVerifyAccount();
  const resend = useResendVerification();
  const { control, handleSubmit, getValues } = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
      verificationCode: "",
    },
  });

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Verify your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the code sent to your email address.
        </p>
      </div>

      <form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit((values) =>
          verify.mutate(values, {
            onSuccess: () => {
              toast.success("Account verified. You can now log in.");
              router.replace("/login");
            },
            onError: (error) =>
              toast.error(getApiErrorMessage(error, "Verification failed.")),
          }),
        )}
      >
        <TextField control={control} name="email" label="Email address" type="email" />
        <TextField
          control={control}
          name="verificationCode"
          label="Verification code"
          placeholder="Enter verification code"
        />
        <Button type="submit" disabled={verify.isPending} className="h-12">
          {verify.isPending ? "Verifying..." : "Verify account"}
        </Button>
      </form>

      <Button
        type="button"
        variant="ghost"
        disabled={resend.isPending}
        onClick={() => {
          const email = getValues("email");
          const parsed = verifySchema.shape.email.safeParse(email);
          if (!parsed.success) {
            toast.error("Enter a valid email address first.");
            return;
          }
          resend.mutate(email, {
            onSuccess: () => toast.success("A new verification code was sent."),
            onError: (error) =>
              toast.error(getApiErrorMessage(error, "Could not resend the code.")),
          });
        }}
      >
        {resend.isPending ? "Sending..." : "Resend verification code"}
      </Button>
    </div>
  );
}
