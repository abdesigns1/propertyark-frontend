"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Controller,
  Control,
  FieldValues,
  Path,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { TextField } from "./text-field";
import { CountryPhoneField } from "./country-phone-field";
import { KycUploadField } from "./kyc-upload-field";
import {
  buyerRegisterSchema,
  vendorRegisterSchema,
  BuyerRegisterValues,
  VendorRegisterValues,
} from "@/features/authentication/validation/register.schema";
import {
  useRegisterBuyer,
  useRegisterVendor,
} from "@/features/authentication/hooks/use-register";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/services/api-error";
import { toast } from "sonner";
import { saveLocalRegistrationProfile } from "@/features/authentication/utils/local-registration-profile";

const BASE_DEFAULTS = {
  firstName: "",
  lastName: "",
  country: "NG",
  phoneNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: true,
};

type RegisterRole = "user" | "vendor";
const RECOVERABLE_REGISTRATION_STATUSES = new Set([403, 502, 503, 504]);

export function RegisterForm() {
  const [role, setRole] = useState<RegisterRole>("user");
  const router = useRouter();

  const registerBuyer = useRegisterBuyer();
  const registerVendor = useRegisterVendor();

  const buyerForm = useForm<BuyerRegisterValues>({
    resolver: zodResolver(buyerRegisterSchema),
    defaultValues: BASE_DEFAULTS,
  });

  const vendorForm = useForm<VendorRegisterValues>({
    resolver: zodResolver(vendorRegisterSchema),
    defaultValues: {
      ...BASE_DEFAULTS,
      kycDocument: undefined as unknown as File,
    },
  });

  function saveRegistrationProfile(
    values: BuyerRegisterValues | VendorRegisterValues,
  ) {
    saveLocalRegistrationProfile({
      id: null,
      fullName: `${values.firstName.trim()} ${values.lastName.trim()}`,
      email: values.email,
      avatarUrl: null,
      phone: values.phoneNumber,
      location: values.country,
    });
  }

  function continueToVerification(email: string) {
    router.push(`/verify?email=${encodeURIComponent(email)}`);
  }

  function handleRegistrationSuccess(
    values: BuyerRegisterValues | VendorRegisterValues,
  ) {
    saveRegistrationProfile(values);
    toast.success(
      "Account created. Check your email for the verification code.",
    );
    continueToVerification(values.email);
  }

  function handleRegistrationError(
    error: unknown,
    values: BuyerRegisterValues | VendorRegisterValues,
  ) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const requestOutcomeIsUncertain =
        error.code === "ECONNABORTED" ||
        !error.response ||
        (status !== undefined && RECOVERABLE_REGISTRATION_STATUSES.has(status));

      if (requestOutcomeIsUncertain) {
        saveRegistrationProfile(values);
        toast.info(
          "Your account may already have been created. Continue to verification to receive your code.",
        );
        continueToVerification(values.email);
        return;
      }
    }

    toast.error(getApiErrorMessage(error, "Unable to create your account."));
  }

  return (
    <div className="flex w-full max-w-md flex-col">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>

      <h1 className="mt-6 text-2xl font-semibold text-foreground sm:text-3xl">
        Create your account
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Join PropertyArk to track favorites, organize viewings, and keep every
        chat, document, and alert in sync.
      </p>

      {/* Manual role toggle — deliberately not using the Tabs primitive */}
      <div className="mt-6 flex w-full items-center gap-6 border-b border-border">
        <button
          type="button"
          onClick={() => setRole("user")}
          className={cn(
            "border-b-2 pb-3 text-sm font-medium transition-colors",
            role === "user"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          User
        </button>
        <button
          type="button"
          onClick={() => setRole("vendor")}
          className={cn(
            "border-b-2 pb-3 text-sm font-medium transition-colors",
            role === "vendor"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          Vendor
        </button>
      </div>

      {role === "user" ? (
        <form
          key="buyer-registration-form"
          onSubmit={buyerForm.handleSubmit((values) =>
            registerBuyer.mutate(values, {
              onSuccess: () => handleRegistrationSuccess(values),
              onError: (error) => handleRegistrationError(error, values),
            }),
          )}
          className="mt-6 flex flex-col gap-5"
        >
          <TextField
            control={buyerForm.control}
            name="firstName"
            label="First Name"
            placeholder="Input your First Name"
          />
          <TextField
            control={buyerForm.control}
            name="lastName"
            label="Last Name"
            placeholder="Input your Last Name"
          />
          <CountryPhoneField
            control={buyerForm.control}
            countryName="country"
            phoneName="phoneNumber"
          />
          <TextField
            control={buyerForm.control}
            name="email"
            label="Email"
            placeholder="Input your Email"
            type="email"
          />
          <TextField
            control={buyerForm.control}
            name="password"
            label="Password"
            placeholder="Input your Password"
            type="password"
          />
          <TextField
            control={buyerForm.control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your Password"
            type="password"
          />
          <TermsCheckbox control={buyerForm.control} />
          <Button
            type="submit"
            disabled={registerBuyer.isPending}
            className="h-12 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            {registerBuyer.isPending ? "Creating account..." : "Register"}
          </Button>
        </form>
      ) : (
        <form
          key="vendor-registration-form"
          onSubmit={vendorForm.handleSubmit((values) =>
            registerVendor.mutate(values, {
              onSuccess: () => handleRegistrationSuccess(values),
              onError: (error) => handleRegistrationError(error, values),
            }),
          )}
          className="mt-6 flex flex-col gap-5"
        >
          <TextField
            control={vendorForm.control}
            name="firstName"
            label="First Name"
            placeholder="Input your First Name"
          />
          <TextField
            control={vendorForm.control}
            name="lastName"
            label="Last Name"
            placeholder="Input your Last Name"
          />
          <CountryPhoneField
            control={vendorForm.control}
            countryName="country"
            phoneName="phoneNumber"
          />
          <TextField
            control={vendorForm.control}
            name="email"
            label="Email"
            placeholder="Input your Email"
            type="email"
          />
          <KycUploadField control={vendorForm.control} name="kycDocument" />
          <TextField
            control={vendorForm.control}
            name="password"
            label="Password"
            placeholder="Input your Password"
            type="password"
          />
          <TextField
            control={vendorForm.control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your Password"
            type="password"
          />
          <TermsCheckbox control={vendorForm.control} />
          <Button
            type="submit"
            disabled={registerVendor.isPending}
            className="h-12 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            {registerVendor.isPending ? "Creating account..." : "Register"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary-hover"
        >
          Login Here
        </Link>
      </p>
    </div>
  );
}

function TermsCheckbox<T extends FieldValues>({
  control,
}: {
  control: Control<T>;
}) {
  return (
    <Controller
      control={control}
      name={"agreeToTerms" as Path<T>}
      render={({ field, fieldState }) => (
        <div>
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              className="mt-0.5 data-[state=checked]:border-secondary data-[state=checked]:bg-secondary"
            />
            <span>
              By signing up confirm you agree to our{" "}
              <Link
                href="/terms"
                className="text-foreground underline underline-offset-2"
              >
                Terms and Condition
              </Link>
            </span>
          </label>
          {fieldState.error && (
            <FieldError>{fieldState.error.message}</FieldError>
          )}
        </div>
      )}
    />
  );
}
