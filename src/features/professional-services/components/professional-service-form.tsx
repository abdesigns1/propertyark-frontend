"use client";

import { useRef, useState } from "react";
import {
  CloudUpload,
  FileText,
  Lightbulb,
  MapPin,
  Send,
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
import { Textarea } from "@/components/ui/textarea";

const SERVICE_TYPES = [
  { label: "Accountant", value: "accountant" },
  { label: "Mortgage Broker", value: "mortgage-broker" },
  { label: "Legal", value: "legal" },
  { label: "Insurance", value: "insurance" },
] as const;

type ServiceType = (typeof SERVICE_TYPES)[number]["value"];

interface ProfessionalServiceFormProps {
  initialService: ServiceType;
}

export function ProfessionalServiceForm({
  initialService,
}: ProfessionalServiceFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [service, setService] = useState<ServiceType>(initialService);
  const [files, setFiles] = useState<File[]>([]);

  function resetForm() {
    formRef.current?.reset();
    setService(initialService);
    setFiles([]);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Your consultation request has been submitted.", {
      description: "A PropertyArk professional will contact you shortly.",
    });
    resetForm();
  }

  function handleFiles(nextFiles: FileList | null) {
    if (!nextFiles) return;
    setFiles((current) => [...current, ...Array.from(nextFiles)].slice(0, 5));
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
              <FieldLabel htmlFor="service-type">Service Type</FieldLabel>
              <Select
                name="serviceType"
                value={service}
                onValueChange={(value) => setService(value as ServiceType)}
              >
                <SelectTrigger id="service-type" className="w-full">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SERVICE_TYPES.map((type) => (
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
                    key={`${file.name}-${file.lastModified}`}
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
          <Button type="button" variant="ghost" onClick={resetForm}>
            Cancel
          </Button>
          <Button type="submit" className="min-w-44">
            <Send data-icon="inline-start" />
            Submit Request
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
