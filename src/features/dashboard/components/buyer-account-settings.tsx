"use client";

import { type FormEvent, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  House,
  KeyRound,
  LoaderCircle,
  MapPin,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  FieldDescription,
  FieldError,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/services/api-error";
import {
  settingsService,
  type VendorSettingsProfile,
} from "@/services/settings.service";
import { useAuthStore } from "@/store/auth.store";
import { useAccountKey } from "@/lib/account-identity";

const notifications = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  message:
    "Please confirm your email address by clicking on the link we just emailed you. If you cannot find the email, you can request a new confirmation email or change your email address.",
  date: "March 1, 2026",
}));

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

function buyerProfileQueryKey(accountKey: string) {
  return ["buyer", "settings", "profile", accountKey] as const;
}

function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const changePassword = useMutation({
    mutationFn: settingsService.changePassword,
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setValidationError("");
      toast.success("Password changed successfully.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Unable to change your password.")),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword.length < 8) {
      setValidationError(
        "Your new password must contain at least 8 characters.",
      );
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setValidationError("The new password and confirmation do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setValidationError(
        "Your new password must differ from your current password.",
      );
      return;
    }

    setValidationError("");
    changePassword.mutate({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <KeyRound className="size-6 text-primary" aria-hidden="true" />
            Change Password
          </CardTitle>
          <CardDescription>
            Enter your current password before choosing a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="current-password">
                  Current Password
                </FieldLabel>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  minLength={8}
                  required
                />
                <FieldDescription>
                  Use at least 8 characters and avoid reusing your current
                  password.
                </FieldDescription>
              </Field>
              <Field data-invalid={Boolean(validationError)}>
                <FieldLabel htmlFor="confirm-new-password">
                  Confirm New Password
                </FieldLabel>
                <Input
                  id="confirm-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmNewPassword}
                  onChange={(event) =>
                    setConfirmNewPassword(event.target.value)
                  }
                  aria-invalid={Boolean(validationError)}
                  minLength={8}
                  required
                />
                {validationError ? (
                  <FieldError>{validationError}</FieldError>
                ) : null}
              </Field>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  className="min-w-44"
                  disabled={changePassword.isPending}
                >
                  {changePassword.isPending ? (
                    <LoaderCircle
                      data-icon="inline-start"
                      className="animate-spin"
                    />
                  ) : null}
                  {changePassword.isPending
                    ? "Changing Password..."
                    : "Change Password"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            Password Security
          </CardTitle>
          <CardDescription>
            A strong, unique password helps keep your account and property
            activity protected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
            <li>Use a mix of letters, numbers, and symbols.</li>
            <li>Do not reuse passwords from other services.</li>
            <li>Never share your password with anyone.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export function BuyerAccountSettings() {
  const storedUser = useAuthStore((state) => state.user);
  const accountKey = useAccountKey();
  const profile = useQuery({
    queryKey: buyerProfileQueryKey(accountKey ?? "unresolved-session"),
    queryFn: settingsService.getProfile,
    enabled: Boolean(accountKey),
    staleTime: 60_000,
  });

  if (profile.isLoading) {
    return (
      <div className="flex flex-col gap-6 pb-12">
        <Skeleton className="h-16 w-72 rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (profile.isError) {
    return (
      <Card className="mx-auto mt-12 max-w-xl">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your account information.
          </p>
          <Button onClick={() => profile.refetch()}>Try again</Button>
        </CardContent>
      </Card>
    );
  }

  const resolvedProfile =
    profile.data ??
    ({
      id: storedUser?.id ?? null,
      fullName: storedUser?.fullName ?? "",
      email: storedUser?.email ?? "",
      phone: storedUser?.phone ?? "",
      location: storedUser?.location ?? "",
      avatarUrl: storedUser?.avatarUrl ?? null,
      businessName: "",
      businessDescription: "",
      cacRegistrationNumber: "",
      taxId: "",
      createdAt: null,
      identityVerificationStatus: "PENDING",
      businessLicenseStatus: "UNAVAILABLE",
      taxCertificationStatus: "UNAVAILABLE",
      twoFactorEnabled: null,
      emailAlerts: null,
      smsNotifications: null,
      pushNotifications: null,
    } satisfies VendorSettingsProfile);

  return (
    <BuyerAccountSettingsContent
      key={`${resolvedProfile.id}-${resolvedProfile.fullName}-${resolvedProfile.avatarUrl}`}
      profile={resolvedProfile}
      accountKey={accountKey!}
    />
  );
}

function BuyerAccountSettingsContent({
  profile,
  accountKey,
}: {
  profile: VendorSettingsProfile;
  accountKey: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const requestedTab = searchParams.get("tab");
  const activeTab =
    requestedTab === "notifications" || requestedTab === "security"
      ? requestedTab
      : "profile";
  const updateUser = useAuthStore((state) => state.updateUser);
  const names = splitName(profile.fullName);
  const [firstName, setFirstName] = useState(names.firstName);
  const [lastName, setLastName] = useState(names.lastName);
  const [phone, setPhone] = useState(profile.phone);
  const [location, setLocation] = useState(profile.location);
  const [bio, setBio] = useState("");
  const [investorType, setInvestorType] = useState("professional");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [visibleNotifications, setVisibleNotifications] =
    useState(notifications);
  const fileInput = useRef<HTMLInputElement>(null);
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "PA";

  function choosePhoto(file?: File) {
    if (!file) return;
    if (file.size > 800 * 1024)
      return toast.error("The photo must be smaller than 800KB.");
    if (!file.type.startsWith("image/"))
      return toast.error("Please choose a JPG, GIF, or PNG image.");
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(String(reader.result));
    reader.readAsDataURL(file);
    setAvatarFile(file);
  }

  const saveProfile = useMutation({
    mutationFn: async () => {
      const submitted = {
        fullName: `${firstName} ${lastName}`.trim(),
        phone: phone.trim(),
        location: location.trim(),
      };
      const profileUpdate = await settingsService.updateProfile(submitted);
      const avatarUpdate = avatarFile
        ? await settingsService.updateAvatar(avatarFile)
        : null;

      return {
        id: profileUpdate.id ?? profile.id,
        fullName: profileUpdate.fullName || submitted.fullName,
        email: profileUpdate.email || profile.email,
        phone: profileUpdate.phone || submitted.phone,
        location: profileUpdate.location || submitted.location,
        avatarUrl:
          avatarUpdate?.avatarUrl ??
          profileUpdate.avatarUrl ??
          profile.avatarUrl,
      };
    },
    onSuccess: (updated) => {
      updateUser({
        fullName: updated.fullName || `${firstName} ${lastName}`.trim(),
        email: updated.email || profile.email,
        phone: updated.phone || phone.trim(),
        location: updated.location || location.trim(),
        avatarUrl: updated.avatarUrl ?? profile.avatarUrl,
      });
      queryClient.setQueryData<VendorSettingsProfile>(
        buyerProfileQueryKey(accountKey),
        (current) => ({
          ...(current ?? profile),
          ...updated,
          fullName: updated.fullName || `${firstName} ${lastName}`.trim(),
          email: updated.email || profile.email,
          phone: updated.phone || phone.trim(),
          location: updated.location || location.trim(),
          avatarUrl: updated.avatarUrl ?? profile.avatarUrl,
        }),
      );
      queryClient.invalidateQueries({ queryKey: ["buyer-dashboard"] });
      setAvatarFile(null);
      toast.success("Profile changes saved successfully.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Unable to save your profile changes."),
      ),
  });

  return (
    <div className="w-full pb-12">
      <FadeIn>
        <header>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Manage your personal information, security, and preferences.
          </p>
        </header>
      </FadeIn>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          router.replace(
            value === "profile"
              ? "/buyer/settings"
              : `/buyer/settings?tab=${value}`,
            { scroll: false },
          )
        }
        className="mt-7 flex-col gap-8"
      >
        <TabsList
          variant="line"
          className="h-12 w-full justify-start gap-7 overflow-x-auto border-b p-0"
        >
          <TabsTrigger
            value="profile"
            className="h-12 flex-none rounded-none px-0 text-base after:bg-primary"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="h-12 flex-none rounded-none px-0 text-base after:bg-primary"
          >
            Security
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="h-12 flex-none rounded-none px-0 text-base after:bg-primary"
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="w-full">
          <div className="flex w-full flex-col gap-8">
            <FadeIn>
              <Card className="py-6 shadow-sm">
                <CardContent className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                  <Avatar className="size-24 rounded-2xl" size="lg">
                    {avatarUrl && (
                      <AvatarImage
                        src={avatarUrl}
                        alt={`${firstName} ${lastName}`}
                        className="rounded-2xl"
                      />
                    )}
                    <AvatarFallback className="rounded-2xl bg-foreground text-xl font-semibold text-background">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-4">
                      <Button
                        className="min-w-36"
                        onClick={() => fileInput.current?.click()}
                      >
                        Change Photo
                      </Button>
                      <Button
                        variant="outline"
                        className="min-w-28"
                        onClick={() => {
                          setAvatarUrl(profile.avatarUrl ?? "");
                          setAvatarFile(null);
                          if (fileInput.current) fileInput.current.value = "";
                        }}
                      >
                        Reset
                      </Button>
                      <input
                        ref={fileInput}
                        type="file"
                        accept="image/png,image/jpeg,image/gif"
                        className="hidden"
                        onChange={(event) => {
                          choosePhoto(event.target.files?.[0]);
                          event.currentTarget.value = "";
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, GIF or PNG. Max size of 800K.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn>
              <Card className="py-6 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-7">
                    <div className="grid gap-7 md:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                        <Input
                          id="firstName"
                          className="h-11 bg-surface/50"
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                        <Input
                          id="lastName"
                          className="h-11 bg-surface/50"
                          value={lastName}
                          onChange={(event) => setLastName(event.target.value)}
                        />
                      </Field>
                      <Field data-disabled>
                        <FieldLabel htmlFor="email">Email Address</FieldLabel>
                        <InputGroup className="h-11 bg-surface/50">
                          <InputGroupInput
                            id="email"
                            value={profile.email}
                            disabled
                          />
                          <InputGroupAddon align="inline-end">
                            <Badge variant="secondary">
                              <CheckCircle2 data-icon="inline-start" />
                              Verified
                            </Badge>
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                        <Input
                          id="phone"
                          className="h-11 bg-surface/50"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          placeholder="+234"
                        />
                      </Field>
                    </div>
                    <Field>
                      <FieldLabel htmlFor="bio">Bio</FieldLabel>
                      <Textarea
                        id="bio"
                        className="min-h-28 bg-surface/50"
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        placeholder="Tell us about yourself and your investment goals."
                      />
                      <FieldDescription>
                        Tell us a little bit about yourself and your investment
                        goals.
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn>
              <Card className="py-6 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <div className="grid gap-7 md:grid-cols-2">
                      <Field>
                        <FieldLabel>Investor Type</FieldLabel>
                        <Select
                          value={investorType}
                          onValueChange={setInvestorType}
                        >
                          <SelectTrigger className="h-11 w-full bg-surface/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="professional">
                                Professional Investor
                              </SelectItem>
                              <SelectItem value="individual">
                                Individual Investor
                              </SelectItem>
                              <SelectItem value="first-time">
                                First-time Buyer
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="location">
                          Primary Location
                        </FieldLabel>
                        <InputGroup className="h-11 bg-surface/50">
                          <InputGroupAddon>
                            <MapPin />
                          </InputGroupAddon>
                          <InputGroupInput
                            id="location"
                            value={location}
                            onChange={(event) =>
                              setLocation(event.target.value)
                            }
                            placeholder="FHA, Lugbe Abuja"
                          />
                        </InputGroup>
                      </Field>
                    </div>
                  </FieldGroup>
                </CardContent>
              </Card>
            </FadeIn>

            <div className="flex justify-end gap-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setFirstName(names.firstName);
                  setLastName(names.lastName);
                  setPhone(profile.phone);
                  setLocation(profile.location);
                  setAvatarUrl(profile.avatarUrl ?? "");
                  setAvatarFile(null);
                }}
                disabled={saveProfile.isPending}
              >
                Cancel
              </Button>
              <Button
                size="lg"
                className="min-w-40"
                onClick={() => saveProfile.mutate()}
                disabled={saveProfile.isPending}
              >
                {saveProfile.isPending ? (
                  <LoaderCircle
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                ) : null}
                {saveProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="w-full">
          <PasswordSettings />
        </TabsContent>

        <TabsContent value="notifications" className="w-full">
          <AnimatePresence initial={false}>
            <div className="flex w-full max-w-2xl flex-col gap-8 pt-6">
              {visibleNotifications.map((notification, index) => (
                <motion.article
                  key={notification.id}
                  exit={{ opacity: 0, x: 30, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex w-full items-start gap-3 sm:gap-4"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted">
                    <House className="size-6 fill-secondary text-secondary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={
                        index === 0
                          ? "font-semibold leading-snug"
                          : "leading-snug text-muted-foreground"
                      }
                    >
                      {notification.message}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.date}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Dismiss notification"
                    onClick={() =>
                      setVisibleNotifications((items) =>
                        items.filter((item) => item.id !== notification.id),
                      )
                    }
                  >
                    <X />
                  </Button>
                </motion.article>
              ))}
            </div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
