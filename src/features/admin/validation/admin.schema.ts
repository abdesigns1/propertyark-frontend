import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.email("Enter a valid work email."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean(),
});

export const staffSetupSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name."),
    email: z.email("Enter a valid work email."),
    employeeId: z.string().min(3, "Enter your employee ID."),
    department: z.string().min(1, "Select your department."),
    location: z.string().min(2, "Enter your location."),
    phone: z.string().min(7, "Enter a valid phone number."),
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string(),
    acceptedTerms: z.literal(true, "Accept the security policy to continue."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const accessRequestSchema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  staffIdentity: z.string().min(3, "Enter your staff ID or work email."),
  department: z.string().min(1, "Select your department."),
  reason: z.string().min(12, "Tell the technical team why you need access."),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
export type StaffSetupValues = z.infer<typeof staffSetupSchema>;
export type AccessRequestValues = z.infer<typeof accessRequestSchema>;
