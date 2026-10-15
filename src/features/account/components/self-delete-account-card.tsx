"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/services/api-error";
import { settingsService } from "@/services/settings.service";
import { useAuthStore } from "@/store/auth.store";

const CONFIRMATION_PHRASE = "DELETE MY ACCOUNT";

export function SelfDeleteAccountCard({
  accountType,
}: {
  accountType: "user" | "vendor";
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [confirmationPhrase, setConfirmationPhrase] = useState("");
  const [validationError, setValidationError] = useState("");

  const resetForm = () => {
    setPassword("");
    setReason("");
    setConfirmationPhrase("");
    setValidationError("");
  };

  const deletion = useMutation({
    mutationFn: () =>
      settingsService.deleteAccount(
        password.trim()
          ? {
              password,
              reason: reason.trim(),
              confirmationPhrase: CONFIRMATION_PHRASE,
            }
          : { confirmationPhrase: CONFIRMATION_PHRASE },
      ),
    onSuccess: () => {
      queryClient.clear();
      clearAuth();
      resetForm();
      setOpen(false);
      toast.success("Your account has been deactivated successfully.");
      router.replace("/");
      router.refresh();
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          "Your account could not be deleted. Check your password and try again.",
        ),
      ),
  });

  const submit = () => {
    if (confirmationPhrase.trim() !== CONFIRMATION_PHRASE) {
      setValidationError(
        `Enter ${CONFIRMATION_PHRASE} exactly as shown to continue.`,
      );
      return;
    }
    if (password.trim() && !reason.trim()) {
      setValidationError("Please provide a reason for deleting your account.");
      return;
    }

    setValidationError("");
    deletion.mutate();
  };

  return (
    <>
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Delete account</CardTitle>
          <CardDescription>
            Soft-delete your {accountType} account and immediately remove your
            access to PropertyArk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You will be signed out after deletion. The backend soft-deletes
            this account rather than immediately erasing its records.
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="destructive" onClick={() => setOpen(true)}>
            <Trash2 data-icon="inline-start" />
            Delete my account
          </Button>
        </CardFooter>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (deletion.isPending) return;
          setOpen(nextOpen);
          if (!nextOpen) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Delete your {accountType} account?</DialogTitle>
            <DialogDescription>
              This will deactivate your account and sign you out of all
              PropertyArk activity.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`${accountType}-delete-password`}>
                Password
              </FieldLabel>
              <Input
                id={`${accountType}-delete-password`}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
              />
              <FieldDescription>
                Leave this blank if you signed up with Google.
              </FieldDescription>
            </Field>

            {password.trim() && (
              <Field>
                <FieldLabel htmlFor={`${accountType}-delete-reason`}>
                  Reason for leaving
                </FieldLabel>
                <Textarea
                  id={`${accountType}-delete-reason`}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Tell us why you no longer need the account"
                />
              </Field>
            )}

            <Field data-invalid={Boolean(validationError)}>
              <FieldLabel htmlFor={`${accountType}-delete-confirmation`}>
                Type {CONFIRMATION_PHRASE} to confirm
              </FieldLabel>
              <Input
                id={`${accountType}-delete-confirmation`}
                value={confirmationPhrase}
                onChange={(event) => setConfirmationPhrase(event.target.value)}
                autoComplete="off"
                aria-invalid={Boolean(validationError)}
                placeholder={CONFIRMATION_PHRASE}
              />
              <FieldError>{validationError}</FieldError>
            </Field>
          </FieldGroup>

          <DialogFooter showCloseButton>
            <Button
              variant="destructive"
              disabled={
                deletion.isPending ||
                confirmationPhrase.trim() !== CONFIRMATION_PHRASE
              }
              onClick={submit}
            >
              {deletion.isPending ? (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                />
              ) : (
                <Trash2 data-icon="inline-start" />
              )}
              {deletion.isPending ? "Deleting account..." : "Delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
