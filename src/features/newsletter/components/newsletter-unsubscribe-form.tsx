"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, MailX } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useNewsletterUnsubscribe } from "@/features/newsletter/hooks/use-newsletter";
import {
  newsletterUnsubscribeSchema,
  type NewsletterUnsubscribeValues,
} from "@/features/newsletter/validation/newsletter.schema";
import { getApiErrorMessage } from "@/services/api-error";

export function NewsletterUnsubscribeForm({ token }: { token: string }) {
  const unsubscribe = useNewsletterUnsubscribe();
  const { control, handleSubmit } = useForm<NewsletterUnsubscribeValues>({
    resolver: zodResolver(newsletterUnsubscribeSchema),
    defaultValues: { reason: "" },
  });

  function onSubmit(values: NewsletterUnsubscribeValues) {
    unsubscribe.mutate(
      { token, reason: values.reason },
      {
        onSuccess: () => toast.success("You have been unsubscribed."),
        onError: (error) =>
          toast.error(
            getApiErrorMessage(error, "We could not unsubscribe you."),
          ),
      },
    );
  }

  if (unsubscribe.isSuccess) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <CardHeader>
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-6" />
          </span>
          <CardTitle>You have been unsubscribed</CardTitle>
          <CardDescription>
            You will no longer receive PropertyArk newsletter emails.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href="/">Return home</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailX className="size-6" />
        </span>
        <CardTitle>Unsubscribe from the newsletter</CardTitle>
        <CardDescription>
          Tell us why you would like to stop receiving PropertyArk updates.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent>
          <Controller
            control={control}
            name="reason"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="unsubscribe-reason">Reason</FieldLabel>
                <Textarea
                  id="unsubscribe-reason"
                  placeholder="e.g. I no longer want to receive property updates"
                  className="min-h-32 resize-y"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
        </CardContent>
        <CardFooter className="mt-6 justify-end gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/">Cancel</Link>
          </Button>
          <Button type="submit" disabled={unsubscribe.isPending}>
            {unsubscribe.isPending && <Spinner data-icon="inline-start" />}
            {unsubscribe.isPending ? "Unsubscribing..." : "Unsubscribe"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
