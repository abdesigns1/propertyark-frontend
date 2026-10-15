"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useNewsletterSubscription } from "@/features/newsletter/hooks/use-newsletter";
import {
  newsletterSubscriptionSchema,
  type NewsletterSubscriptionValues,
} from "@/features/newsletter/validation/newsletter.schema";
import { getApiErrorMessage } from "@/services/api-error";

export function NewsletterSignupForm() {
  const subscription = useNewsletterSubscription();
  const { control, handleSubmit, reset } =
    useForm<NewsletterSubscriptionValues>({
      resolver: zodResolver(newsletterSubscriptionSchema),
      defaultValues: { name: "", email: "" },
    });

  function onSubmit(values: NewsletterSubscriptionValues) {
    subscription.mutate(values, {
      onSuccess: () => {
        toast.success("You are subscribed to the PropertyArk newsletter.");
        reset();
      },
      onError: (error) =>
        toast.error(
          getApiErrorMessage(error, "Newsletter subscription failed."),
        ),
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-2xl"
      noValidate
    >
      <FieldGroup className="gap-3 sm:grid sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)_auto] sm:items-start">
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="newsletter-name" className="sr-only">
                Name
              </FieldLabel>
              <Input
                id="newsletter-name"
                placeholder="Your name"
                autoComplete="name"
                className="h-12 border-0 bg-white text-foreground"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.error && (
                <FieldError className="text-white">
                  {fieldState.error.message}
                </FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="newsletter-email" className="sr-only">
                Email address
              </FieldLabel>
              <Input
                id="newsletter-email"
                type="email"
                placeholder="Your email address"
                autoComplete="email"
                className="h-12 border-0 bg-white text-foreground"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.error && (
                <FieldError className="text-white">
                  {fieldState.error.message}
                </FieldError>
              )}
            </Field>
          )}
        />

        <Button
          type="submit"
          disabled={subscription.isPending}
          className="h-12 shrink-0 rounded-lg bg-secondary px-6 text-secondary-foreground hover:bg-secondary-hover"
        >
          {subscription.isPending && <Spinner data-icon="inline-start" />}
          {subscription.isPending ? "Subscribing..." : "Subscribe"}
        </Button>
      </FieldGroup>
    </form>
  );
}
