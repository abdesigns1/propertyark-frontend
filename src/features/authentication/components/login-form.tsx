"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TextField } from "./text-field";
import {
  loginSchema,
  LoginValues,
} from "@/features/authentication/validation/login.schema";
import { useLogin } from "@/features/authentication/hooks/use-login";
import { useAuthStore } from "@/store/auth.store";
import { getApiErrorMessage } from "@/services/api-error";
import { getDashboardPath } from "@/features/authentication/utils/dashboard-route";
import { normalizeLoginResponse } from "@/features/authentication/utils/normalize-login-response";
import { toast } from "sonner";
import { getLocalRegistrationProfile } from "@/features/authentication/utils/local-registration-profile";

export function LoginForm() {
  const login = useLogin();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { control, handleSubmit } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  return (
    <div className="flex w-full max-w-md flex-col">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="mt-12">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Account Login
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          If you are already a User you can login with your email address and
          password.
        </p>
      </div>

      <div className="mt-6 border-t border-border" />

      <form
        onSubmit={handleSubmit((values) =>
          login.mutate(values, {
            onSuccess: (response) => {
              const auth = normalizeLoginResponse(response);
              const registeredProfile = getLocalRegistrationProfile(values.email);
              const user = auth.user?.fullName && auth.user.fullName !== "PropertyArk User"
                ? auth.user
                : registeredProfile ?? auth.user;

              setAuth({
                accessToken: auth.accessToken,
                userId: auth.userId,
                role: auth.role,
                user,
              });

              toast.success("Welcome back");
              const requestedRedirect = new URLSearchParams(window.location.search).get("redirect");
              const safeRedirect = requestedRedirect?.startsWith("/") && !requestedRedirect.startsWith("//")
                ? requestedRedirect
                : getDashboardPath(auth.role);
              router.replace(safeRedirect);
            },
            onError: (error) => {
              toast.error(
                getApiErrorMessage(error, "Unable to log in with those details."),
              );
            },
          }),
        )}
        className="mt-6 flex flex-col gap-5"
      >
        <TextField
          control={control}
          name="email"
          label="Email address"
          placeholder="Input your Email address"
          type="email"
        />
        <TextField
          control={control}
          name="password"
          label="Password"
          placeholder="Input your Password"
          type="password"
        />

        <Controller
          control={control}
          name="rememberMe"
          render={({ field }) => (
            <label className="flex w-fit items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-0.5 data-[state=checked]:border-secondary data-[state=checked]:bg-secondary"
              />
              Remember me
            </label>
          )}
        />

        <Button
          type="submit"
          disabled={login.isPending}
          className="h-12 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          {login.isPending ? "Logging in..." : "Login"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-lg border-border text-sm font-medium text-foreground hover:bg-accent"
        >
          <Image src="/icons8-google-50.svg" alt="" width={18} height={18} />
          Continue with Google
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Dont have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:text-primary-hover"
        >
          Sign up here
        </Link>
      </p>
    </div>
  );
}
