"use client";

import { FormEvent, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, LoaderCircle, Save, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const fileInput = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const initialForm = {
    fullName: profile.fullName,
    phone: profile.phone,
    location: profile.location,
  };
  const [form, setForm] = useState(initialForm);
  const initials =
    form.fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "PA";
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
  const avatarMutation = useMutation({
    mutationFn: settingsService.updateAvatar,
    onSuccess: (updated) => {
      const nextAvatarUrl = updated.avatarUrl ?? null;
      setAvatarUrl(nextAvatarUrl ?? "");
      updateUser({ avatarUrl: nextAvatarUrl });
      queryClient.setQueryData<VendorSettingsProfile>(profileKey, updated);
      toast.success("Admin profile picture updated.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The profile picture could not be updated."),
      ),
  });
  const removeAvatarMutation = useMutation({
    mutationFn: settingsService.removeAvatar,
    onSuccess: (updated) => {
      setAvatarUrl("");
      updateUser({ avatarUrl: null });
      queryClient.setQueryData<VendorSettingsProfile>(profileKey, {
        ...updated,
        avatarUrl: null,
      });
      toast.success("Admin profile picture removed.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The profile picture could not be removed."),
      ),
  });

  function chooseAvatar(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      toast.error("Choose a JPG, PNG, or GIF image.");
      return;
    }
    if (file.size > 800 * 1024) {
      toast.error("The image must be 800 KB or smaller.");
      return;
    }
    avatarMutation.mutate(file);
  }

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
            <Field className="md:col-span-2">
              <FieldLabel>Profile picture</FieldLabel>
              <div className="flex flex-col items-center gap-4 rounded-xl border p-4 sm:flex-row">
                <Avatar className="size-24 rounded-2xl">
                  <AvatarImage
                    src={avatarUrl || undefined}
                    alt={form.fullName}
                    className="rounded-2xl object-cover"
                  />
                  <AvatarFallback className="rounded-2xl text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center gap-2 sm:items-start">
                  <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInput.current?.click()}
                      disabled={
                        avatarMutation.isPending ||
                        removeAvatarMutation.isPending
                      }
                    >
                      {avatarMutation.isPending ? (
                        <LoaderCircle
                          data-icon="inline-start"
                          className="animate-spin"
                        />
                      ) : (
                        <Camera data-icon="inline-start" />
                      )}
                      {avatarMutation.isPending
                        ? "Uploading..."
                        : "Change picture"}
                    </Button>
                    {avatarUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeAvatarMutation.mutate()}
                        disabled={
                          avatarMutation.isPending ||
                          removeAvatarMutation.isPending
                        }
                      >
                        {removeAvatarMutation.isPending ? (
                          <LoaderCircle
                            data-icon="inline-start"
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 data-icon="inline-start" />
                        )}
                        {removeAvatarMutation.isPending
                          ? "Removing..."
                          : "Remove"}
                      </Button>
                    )}
                  </div>
                  <FieldDescription>
                    JPG, PNG, or GIF. Maximum size 800 KB.
                  </FieldDescription>
                </div>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  aria-label="Choose administrator profile picture"
                  onChange={(event) => {
                    chooseAvatar(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </div>
            </Field>
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
