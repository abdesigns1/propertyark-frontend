import { z } from "zod";

export const verifySchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  verificationCode: z.string().trim().min(1, "Enter your verification code"),
});

export type VerifyValues = z.infer<typeof verifySchema>;
