"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/services/api-error";
import {
  settingsService,
  type VendorSettingsProfile,
} from "@/services/settings.service";
import { useAuthStore } from "@/store/auth.store";

const profileKey = ["admin", "settings", "profile"] as const;

export function AdminGeneralSettings() {
  const query = useQuery({
    queryKey: profileKey,
    queryFn: settingsService.getProfile,
  });
  if (query.isLoading)
    return <Skeleton className="h-[520px] w-full rounded-xl" />;
  if (!query.data) return null;
  return <AdminGeneralSettingsForm key={query.data.id} profile={query.data} />;
}

function AdminGeneralSettingsForm({
  profile,
}: {
  profile: VendorSettingsProfile;
}) {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);
  const initialForm = {
    fullName: profile.fullName,
    phone: profile.phone,
    location: profile.location,
  };
  const [form, setForm] = useState(initialForm);
  const mutation = useMutation({
    mutationFn: settingsService.updateProfile,
    onSuccess: async (profile) => {
      updateUser({
        fullName: profile.fullName,
        phone: profile.phone,
        location: profile.location,
      });
      await queryClient.invalidateQueries({ queryKey: profileKey });
      toast.success("Admin profile updated.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Profile changes could not be saved."),
      ),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(form);
  }

  return (
    <form onSubmit={submit}>
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <UserCog className="size-5 text-primary" /> Account Information
          </CardTitle>
          <CardDescription>
            Update the contact details attached to your authenticated
            administrator account.
          </CardDescription>
          <CardAction>
            <Badge variant="secondary">
              ID: {profile.id?.slice(-10).toUpperCase() ?? "ADMIN"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-5 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="admin-name">Full name</FieldLabel>
              <Input
                id="admin-name"
                required
                value={form.fullName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fullName: event.target.value,
                  }))
                }
              />
            </Field>
            <Field data-disabled>
              <FieldLabel htmlFor="admin-email">Email address</FieldLabel>
              <Input id="admin-email" disabled value={profile.email} />
              <FieldDescription>
                Email is managed by your authenticated account.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="admin-phone">Phone number</FieldLabel>
              <Input
                id="admin-phone"
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="admin-location">Location</FieldLabel>
              <Input
                id="admin-location"
                value={form.location}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setForm(initialForm)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending || !form.fullName.trim()}
          >
            <Save data-icon="inline-start" />
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
