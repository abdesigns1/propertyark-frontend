"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/services/api-error";
import {
  staffSetupSchema,
  type StaffSetupValues,
} from "@/features/admin/validation/admin.schema";

const departments = [
  "IT & Systems Security",
  "Property Management",
  "Finance",
  "Customer Experience",
  "Legal & Compliance",
  "Sales & Marketing",
];

export function StaffSetupForm() {
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffSetupValues>({
    resolver: zodResolver(staffSetupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      employeeId: "",
      department: "",
      location: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false as true,
    },
  });
  const passwordLength = useWatch({ control, name: "password" }).length;

  async function onSubmit(values: StaffSetupValues) {
    setPending(true);
    try {
      await authService.registerStaff({
        fullName: values.fullName,
        email: values.email,
        employeeId: values.employeeId,
        department: values.department,
        location: values.location,
        phone: values.phone,
        password: values.password,
      });
      toast.success("Staff account setup is complete");
      router.replace("/admin/login");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to complete staff setup."));
    } finally {
      setPending(false);
    }
  }

  const textField = (
    name: "fullName" | "email" | "employeeId" | "location" | "phone",
    label: string,
    type = "text",
  ) => (
    <Field data-invalid={Boolean(errors[name])}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        type={type}
        aria-invalid={Boolean(errors[name])}
        className="h-12 bg-white"
        {...register(name)}
      />
      <FieldError errors={[errors[name]]} />
    </Field>
  );

  return (
    <Card className="w-full border-white/70 bg-white/85 py-0 shadow-2xl backdrop-blur-xl">
      <CardContent className="p-7 sm:p-9">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              {textField("fullName", "Full name")}
              {textField("email", "Work email", "email")}
              {textField("employeeId", "Employee ID")}
              <Field data-invalid={Boolean(errors.department)}>
                <FieldLabel>Department</FieldLabel>
                <Controller
                  control={control}
                  name="department"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className="h-12 w-full bg-white"
                        aria-invalid={Boolean(errors.department)}
                      >
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {departments.map((department) => (
                            <SelectItem key={department} value={department}>
                              {department}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.department]} />
              </Field>
              {textField("location", "Location")}
              {textField("phone", "Phone number", "tel")}
            </div>
            <Separator />
            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="password">Set password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={visible ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password)}
                  className="h-12 bg-white pr-12"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={visible ? "Hide passwords" : "Show passwords"}
                  onClick={() => setVisible((value) => !value)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {visible ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full bg-primary transition-[width]"
                  style={{
                    width: `${Math.min(passwordLength / 12, 1) * 100}%`,
                  }}
                />
              </div>
              <FieldError errors={[errors.password]} />
            </Field>
            <Field data-invalid={Boolean(errors.confirmPassword)}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm password
              </FieldLabel>
              <Input
                id="confirmPassword"
                type={visible ? "text" : "password"}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                className="h-12 bg-white"
                {...register("confirmPassword")}
              />
              <FieldError errors={[errors.confirmPassword]} />
            </Field>
            <Controller
              control={control}
              name="acceptedTerms"
              render={({ field }) => (
                <Field data-invalid={Boolean(errors.acceptedTerms)}>
                  <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                    <span>
                      I agree to the PropertyArk{" "}
                      <Link href="/privacy-policy" className="text-primary">
                        Internal Security Policy
                      </Link>{" "}
                      and{" "}
                      <Link href="/terms" className="text-primary">
                        Terms of Admin Access
                      </Link>
                      . I understand that administrative actions are logged and
                      audited.
                    </span>
                  </label>
                  <FieldError errors={[errors.acceptedTerms]} />
                </Field>
              )}
            />
            <Button type="submit" disabled={pending} className="h-12">
              {pending ? "Completing setup…" : "Complete Setup"}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
