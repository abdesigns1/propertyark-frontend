import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  subject: z.string().trim().min(3, "Enter a subject"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
  agreeToTerms: z.boolean().refine((v) => v === true, {
    message: "You must agree to the Terms and Privacy Policy",
  }),
});

export type ContactValues = z.infer<typeof contactSchema>;
