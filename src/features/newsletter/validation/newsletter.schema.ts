import { z } from "zod";

export const newsletterSubscriptionSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().email("Enter a valid email address"),
});

export const newsletterUnsubscribeSchema = z.object({
  reason: z.string().trim().min(3, "Please tell us why you are unsubscribing"),
});

export type NewsletterSubscriptionValues = z.infer<
  typeof newsletterSubscriptionSchema
>;
export type NewsletterUnsubscribeValues = z.infer<
  typeof newsletterUnsubscribeSchema
>;
