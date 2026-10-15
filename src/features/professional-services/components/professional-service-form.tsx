"use client";

import { useRef, useState } from "react";
import {
  CloudUpload,
  FileText,
  Lightbulb,
  Mail,
  MapPin,
  Phone,
  Send,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  PROFESSIONAL_SERVICE_OPTIONS,
  professionalServiceApiValue,
  type ProfessionalServiceValue,
} from "@/features/professional-services/lib/professional-service-options";
import { getApiErrorMessage } from "@/services/api-error";
import { professionalServiceService } from "@/services/professional-service.service";
import { useAuthStore } from "@/store/auth.store";

interface ProfessionalServiceFormProps {
  initialService: ProfessionalServiceValue;
}

export function ProfessionalServiceForm({
  initialService,
}: ProfessionalServiceFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((state) => state.user);
  const [service, setService] =
    useState<ProfessionalServiceValue>(initialService);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    formRef.current?.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
    setService(initialService);
    setFiles([]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const submittedFullName = String(formData.get("fullName") ?? "").trim();
    const submittedEmail = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const consultationDate = String(
      formData.get("consultationDate") ?? "",
    ).trim();
    const propertyReference = String(
      formData.get("propertyReference") ?? "",
    ).trim();
    const message = String(formData.get("serviceBrief") ?? "").trim();

    setIsSubmitting(true);
    try {
      await professionalServiceService.create({
        fullName: submittedFullName,
        email: submittedEmail,
        phone,
        serviceType: professionalServiceApiValue(service),
        consultationDate: new Date(
          `${consultationDate}T10:00:00.000Z`,
        ).toISOString(),
        propertyReference: propertyReference || undefined,
        message,
        documents: files,
      });
      toast.success("Your consultation request has been submitted.", {
        description: "A PropertyArk professional will contact you shortly.",
      });
      resetForm();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Your professional service request could not be submitted.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFiles(nextFiles: FileList | null) {
    if (!nextFiles) return;
    setFiles((current) => {
      const combined = [...current, ...Array.from(nextFiles)];
      if (combined.length > 5) {
        toast.info("You can attach up to five documents.");
      }
      return combined.slice(0, 5);
    });
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form ref={formRef} onSubmit={handleSubmit} className="min-w-0">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Request Professional Service
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete the form below to initiate a consultation request.
          </p>
        </div>

        <Separator className="my-6" />

        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="professional-service-full-name">
                Full Name
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <UserRound />
                </InputGroupAddon>
                <InputGroupInput
                  key={`professional-service-name-${user?.id ?? "guest"}`}
                  id="professional-service-full-name"
                  name="fullName"
                  defaultValue={user?.fullName ?? ""}
                  autoComplete="name"
                  placeholder="Enter your full name"
                  required
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="professional-service-email">
                Email Address
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
                <InputGroupInput
                  key={`professional-service-email-${user?.id ?? "guest"}`}
                  id="professional-service-email"
                  name="email"
                  type="email"
                  defaultValue={user?.email ?? ""}
                  autoComplete="email"
                  placeholder="Enter your email address"
                  required
                />
              </InputGroup>
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="service-type">Service Type</FieldLabel>
              <Select
                name="serviceType"
                value={service}
                onValueChange={(value) =>
                  setService(value as ProfessionalServiceValue)
                }
              >
                <SelectTrigger id="service-type" className="w-full">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PROFESSIONAL_SERVICE_OPTIONS.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="consultation-date">
                Preferred Consultation Date
              </FieldLabel>
              <Input
                id="consultation-date"
                name="consultationDate"
                type="date"
                required
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="professional-service-phone">
              Phone Number
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Phone />
              </InputGroupAddon>
              <InputGroupInput
                id="professional-service-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="e.g. +234 801 234 5678"
                required
              />
            </InputGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor="property-reference">
              Property Reference{" "}
              <span className="font-normal text-muted-foreground">
                (Optional)
              </span>
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <MapPin />
              </InputGroupAddon>
              <InputGroupInput
                id="property-reference"
                name="propertyReference"
                placeholder="e.g. PA-4829-NYC"
              />
            </InputGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor="service-brief">
              Professional Service Brief
            </FieldLabel>
            <Textarea
              id="service-brief"
              name="serviceBrief"
              placeholder="Tell us about your requirements..."
              className="min-h-36 resize-y"
              required
            />
            <FieldDescription>
              Please include any specific deadlines or compliance concerns.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="relevant-documents">
              Relevant Documents
            </FieldLabel>
            <label
              htmlFor="relevant-documents"
              className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-input bg-background px-6 py-8 text-center transition-colors hover:bg-accent/50"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFiles(event.dataTransfer.files);
              }}
            >
              <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CloudUpload className="size-6" />
              </span>
              <span className="text-sm font-semibold text-foreground">
                Drag & Drop or Click to Upload
              </span>
              <span className="mt-1 text-sm text-muted-foreground">
                Upload relevant property files (PDF, JPG, PNG)
              </span>
            </label>
            <Input
              ref={fileInputRef}
              id="relevant-documents"
              name="documents"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              className="sr-only"
              onChange={(event) => handleFiles(event.target.files)}
            />

            {files.length > 0 && (
              <ul
                className="flex flex-col gap-2"
                aria-label="Selected documents"
              >
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${file.lastModified}-${file.size}-${index}`}
                    className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm"
                  >
                    <FileText className="size-4 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${file.name}`}
                      onClick={() =>
                        setFiles((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      <X />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Field>
        </FieldGroup>

        <Separator className="my-7" />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={resetForm}
          >
            Cancel
          </Button>
          <Button type="submit" className="min-w-44" disabled={isSubmitting}>
            {isSubmitting ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Send data-icon="inline-start" />
            )}
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>

      <Card className="border-primary/20 bg-primary text-primary-foreground shadow-none lg:mt-16">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-primary-foreground">
            <Lightbulb className="size-5" />
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm leading-relaxed text-primary-foreground/80">
          <p>Ensure your brief is well described.</p>
          <p>Avoid glare on IDs when taking photos.</p>
          <p>PDF format is recommended for multi-page deeds.</p>
        </CardContent>
      </Card>
    </div>
  );
}
