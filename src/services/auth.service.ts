import { api } from "@/services/axios";
import type {
  BuyerRegisterValues,
  VendorRegisterValues,
} from "@/features/authentication/validation/register.schema";
import { COUNTRIES } from "@/constants/countries";

export interface LoginResponse {
  id?: string;
  _id?: string;
  accessToken?: string;
  token?: string;
  userId?: string;
  role?: string;
  fullName?: string;
  name?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  avatar?: string;
  profilePicture?: string;
  user?: {
    id?: string;
    _id?: string;
    role?: string;
    fullName?: string;
    name?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    location?: string;
    avatar?: string;
    profilePicture?: string;
  };
  data?: LoginResponse;
  result?: LoginResponse;
  profile?: LoginResponse["user"];
  message?: string;
}

export interface StaffRegistrationPayload {
  fullName: string;
  email: string;
  password: string;
  employeeId: string;
  department: string;
  location: string;
  phone: string;
}

function registrationFields(
  values: BuyerRegisterValues | VendorRegisterValues,
) {
  const country = COUNTRIES.find((item) => item.code === values.country);
  const localPhone = values.phoneNumber.replace(/^0+/, "");

  return {
    fullName: `${values.firstName.trim()} ${values.lastName.trim()}`,
    email: values.email,
    password: values.password,
    location: country?.name ?? values.country,
    phone: `${country?.dialCode ?? ""}${localPhone}`,
  };
}

export const authService = {
  registerBuyer: (payload: BuyerRegisterValues) =>
    api.post("/auth/reg", {
      ...registrationFields(payload),
      role: "USER",
    }),

  registerVendor: (payload: VendorRegisterValues) => {
    const formData = new FormData();
    const fields = { ...registrationFields(payload), role: "VENDOR" };

    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("ninPhoto", payload.kycDocument);

    return api.post("/auth/reg", formData);
  },

  login: ({ email, password }: { email: string; password: string }) =>
    api
      .post<LoginResponse>("/auth/login", { email, password })
      .then(({ data }) => data),

  registerStaff: (payload: StaffRegistrationPayload) =>
    api.post("/auth/reg/staff", payload).then(({ data }) => data),

  verify: (payload: { email: string; verificationCode: string }) =>
    api.put("/auth/verify", payload),

  resendVerification: (email: string) => api.post("/auth/resend", { email }),

  refresh: () => api.post("/auth/refresh", {}, { withCredentials: true }),

  logout: () => api.post("/auth/logout"),
};
