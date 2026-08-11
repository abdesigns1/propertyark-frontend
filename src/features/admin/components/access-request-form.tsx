"use client";

import { Send, ShieldCheck } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  accessRequestSchema,
  type AccessRequestValues,
} from "@/features/admin/validation/admin.schema";

const departments = [
  "IT & Systems Security",
  "Property Management",
  "Finance",
  "Customer Experience",
  "Legal & Compliance",
  "Sales & Marketing",
];

export function AccessRequestForm() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccessRequestValues>({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: {
      fullName: "",
      staffIdentity: "",
      department: "",
      reason: "",
    },
  });

  async function onSubmit(values: AccessRequestValues) {
    const subject = encodeURIComponent(
      `Admin access request — ${values.fullName}`,
    );
    const body = encodeURIComponent(
      `Full name: ${values.fullName}\nStaff ID / email: ${values.staffIdentity}\nDepartment: ${values.department}\n\nReason for access:\n${values.reason}`,
    );
    window.open(
      `mailto:technical@propertyark.com?subject=${subject}&body=${body}`,
      "_self",
    );
    toast.success("Your request has been prepared for the technical team.");
    reset();
  }

  return (
    <Card className="border-border/80 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Request Access</CardTitle>
        <CardDescription>
          Complete the form below to initiate your admin request.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.fullName)}>
              <FieldLabel htmlFor="request-name">Full name</FieldLabel>
              <Input
                id="request-name"
                placeholder="John Doe"
                aria-invalid={Boolean(errors.fullName)}
                className="h-12 bg-surface/50"
                {...register("fullName")}
              />
              <FieldError errors={[errors.fullName]} />
            </Field>
            <Field data-invalid={Boolean(errors.staffIdentity)}>
              <FieldLabel htmlFor="staffIdentity">
                Staff ID / corporate email
              </FieldLabel>
              <Input
                id="staffIdentity"
                placeholder="PA-12345 or email@PropertyArk.com"
                aria-invalid={Boolean(errors.staffIdentity)}
                className="h-12 bg-surface/50"
                {...register("staffIdentity")}
              />
              <FieldError errors={[errors.staffIdentity]} />
            </Field>
            <Field data-invalid={Boolean(errors.department)}>
              <FieldLabel>Department</FieldLabel>
              <Controller
                control={control}
                name="department"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="h-12 w-full bg-surface/50"
                      aria-invalid={Boolean(errors.department)}
                    >
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {departments.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.department]} />
            </Field>
            <Field data-invalid={Boolean(errors.reason)}>
              <FieldLabel htmlFor="reason">Reason for access</FieldLabel>
              <Textarea
                id="reason"
                placeholder="Briefly describe why you need administrative access…"
                aria-invalid={Boolean(errors.reason)}
                className="min-h-28 bg-surface/50"
                {...register("reason")}
              />
              <FieldError errors={[errors.reason]} />
            </Field>
            <aside className="flex gap-3 rounded-lg bg-secondary/15 p-4 text-sm leading-5 text-muted-foreground">
              <ShieldCheck className="mt-0.5 shrink-0 text-secondary" />
              <p>
                All requests are logged for security auditing. Access is subject
                to the Internal Security Policy.
              </p>
            </aside>
            <Button type="submit" disabled={isSubmitting} className="h-12">
              Submit Request
              <Send data-icon="inline-end" />
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
