"use client";

import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  contactSchema,
  ContactValues,
} from "@/features/messages/validation/contact.schema";
import { useContactForm } from "@/features/messages/hooks/use-contact-form";
import { getApiErrorMessage } from "@/services/api-error";

export function ContactForm() {
  const contact = useContactForm();

  const { control, handleSubmit, reset } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      subject: "",
      message: "",
      agreeToTerms: false,
    },
  });

  function onSubmit(values: ContactValues) {
    contact.mutate(values, {
      onSuccess: () => {
        toast.success("Your message has been sent.", {
          description: "The PropertyArk team will get back to you shortly.",
        });
        reset();
      },
      onError: (error) =>
        toast.error(
          getApiErrorMessage(error, "Your message could not be sent."),
        ),
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FieldGroup>
        <Controller
          control={control}
          name="fullName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
              <Input
                id="fullName"
                placeholder="Enter your Fullname"
                className="h-12"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="Enter your Email Address"
                className="h-12"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="subject"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="subject">Subject</FieldLabel>
              <Input
                id="subject"
                placeholder="Enter your Subject here"
                className="h-12"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="message"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="message">Message</FieldLabel>
              <Textarea
                id="message"
                placeholder="Enter your Message here"
                className="min-h-[140px]"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="agreeToTerms"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  className="mt-0.5 data-[state=checked]:border-secondary data-[state=checked]:bg-secondary"
                />
                <span>
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-secondary hover:underline"
                  >
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-secondary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        disabled={contact.isPending}
        className="h-12 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover"
      >
        {contact.isPending && <Spinner data-icon="inline-start" />}
        {contact.isPending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
