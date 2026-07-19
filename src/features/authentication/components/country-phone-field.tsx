"use client";

import {
  Controller,
  Control,
  FieldValues,
  Path,
  useWatch,
} from "react-hook-form";
import Image from "next/image";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@/constants/countries";
import { cn } from "@/lib/utils";

interface CountryPhoneFieldProps<T extends FieldValues> {
  control: Control<T>;
  countryName: Path<T>;
  phoneName: Path<T>;
}

export function CountryPhoneField<T extends FieldValues>({
  control,
  countryName,
  phoneName,
}: CountryPhoneFieldProps<T>) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.3fr]">
      <Controller
        control={control}
        name={countryName}
        render={({ field, fieldState }) => {
          const selected =
            COUNTRIES.find((c) => c.code === field.value) ?? COUNTRIES[0];
          return (
            <Field>
              <FieldLabel>Country</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-12">
                  <span className="flex items-center gap-2">
                    <Image
                      src={selected.flagUrl}
                      alt={selected.name}
                      width={20}
                      height={14}
                      className="rounded-sm object-cover"
                    />
                    <SelectValue />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <Image
                          src={c.flagUrl}
                          alt={c.name}
                          width={20}
                          height={14}
                          className="rounded-sm object-cover"
                        />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          );
        }}
      />

      <Controller
        control={control}
        name={phoneName}
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel htmlFor={phoneName}>Phone number</FieldLabel>
            <div
              className={cn(
                "flex h-12 items-center rounded-md border border-input bg-background",
                fieldState.error && "border-destructive",
              )}
            >
              <DialCodePrefix control={control} countryName={countryName} />
              <Input
                id={phoneName}
                name={field.name}
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                ref={field.ref}
                placeholder="Input your phone"
                inputMode="numeric"
                aria-invalid={!!fieldState.error}
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
                className="h-full border-0 shadow-none focus-visible:ring-0"
              />
            </div>
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />
    </div>
  );
}

function DialCodePrefix<T extends FieldValues>({
  control,
  countryName,
}: {
  control: Control<T>;
  countryName: Path<T>;
}) {
  const countryCode = useWatch({ control, name: countryName });
  const country = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];
  return (
    <span className="whitespace-nowrap border-r border-input px-3 text-sm text-muted-foreground">
      {country.dialCode}
    </span>
  );
}
