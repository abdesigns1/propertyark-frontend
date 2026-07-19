import { z } from "zod";

const MAX_FILE_SIZE_MB = 50;
const ACCEPTED_KYC_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "video/mp4",
];

const baseFields = {
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters"),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
  country: z.string().min(1, "Select a country"),
  phoneNumber: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .regex(/^[0-9]+$/, "Digits only, no spaces or symbols"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine((v) => v === true, {
    message: "You must agree to the Terms and Conditions",
  }),
};

export const buyerRegisterSchema = z
  .object(baseFields)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const vendorRegisterSchema = z
  .object({
    ...baseFields,
    kycDocument: z
      .instanceof(File, { message: "KYC document is required for vendors" })
      .refine((f) => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024, {
        message: `File must be under ${MAX_FILE_SIZE_MB}MB`,
      })
      .refine((f) => ACCEPTED_KYC_TYPES.includes(f.type), {
        message: "File must be JPEG, PNG, PDF, or MP4",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type BuyerRegisterValues = z.infer<typeof buyerRegisterSchema>;
export type VendorRegisterValues = z.infer<typeof vendorRegisterSchema>;
