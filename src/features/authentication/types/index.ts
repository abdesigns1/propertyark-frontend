export type AuthRole = "buyer" | "vendor";

export interface RegisterBaseFields {
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}
