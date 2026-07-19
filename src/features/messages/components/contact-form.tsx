"use client";

import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  contactSchema,
  ContactValues,
} from "@/features/messages/validation/contact.schema";
import { useContactForm } from "@/features/messages/hooks/use-contact-form";

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
    contact.mutate(values, { onSuccess: () => reset() });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Controller
        control={control}
        name="fullName"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
            <Input
              id="fullName"
              placeholder="Enter your Fullname"
              className="h-12"
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
          <Field>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="Enter your Email Address"
              className="h-12"
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
          <Field>
            <FieldLabel htmlFor="subject">Subject</FieldLabel>
            <Input
              id="subject"
              placeholder="Enter your Subject here"
              className="h-12"
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
          <Field>
            <FieldLabel htmlFor="message">Message</FieldLabel>
            <Textarea
              id="message"
              placeholder="Enter your Message here"
              className="min-h-[140px]"
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
          <div>
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-0.5 data-[state=checked]:border-secondary data-[state=checked]:bg-secondary"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-secondary hover:underline">
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
          </div>
        )}
      />

      <Button
        type="submit"
        disabled={contact.isPending}
        className="h-12 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover"
      >
        {contact.isPending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
