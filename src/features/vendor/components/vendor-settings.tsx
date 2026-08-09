"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CreditCard,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Megaphone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/services/api-error";
import {
  settingsService,
  type VendorSettingsProfile,
  vendorProfileQueryKey,
} from "@/services/settings.service";
import { useAuthStore } from "@/store/auth.store";
import { useAccountKey } from "@/lib/account-identity";
import { cn } from "@/lib/utils";

type Section =
  | "profile"
  | "business"
  | "password"
  | "notifications"
  | "payment"
  | "account";
const sections: Array<{
  id: Section;
  label: string;
  group: string;
  icon: typeof UserRound;
  available: boolean;
}> = [
  {
    id: "profile",
    label: "Profile Info",
    group: "Account settings",
    icon: UserRound,
    available: true,
  },
  {
    id: "business",
    label: "Business Info",
    group: "Account settings",
    icon: BriefcaseBusiness,
    available: true,
  },
  {
    id: "password",
    label: "Password",
    group: "Security",
    icon: KeyRound,
    available: true,
  },
  {
    id: "notifications",
    label: "Notifications",
    group: "Preferences",
    icon: Bell,
    available: false,
  },
  {
    id: "payment",
    label: "Payment Settings",
    group: "Financial",
    icon: CreditCard,
    available: false,
  },
  {
    id: "account",
    label: "Account Management",
    group: "Advanced",
    icon: ShieldCheck,
    available: false,
  },
];

function SettingsNavigation({
  active,
  onChange,
}: {
  active: Section;
  onChange: (section: Section) => void;
}) {
  const groups = [...new Set(sections.map((item) => item.group))];
  return (
    <nav
      aria-label="Settings sections"
      className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-6"
    >
      {groups.map((group) => (
        <div key={group} className="flex shrink-0 flex-col gap-1">
          <p className="hidden px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:block">
            {group}
          </p>
          {sections
            .filter((item) => item.group === group)
            .map(({ id, label, icon: Icon, available }) => (
              <Button
                key={id}
                type="button"
                variant={active === id ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => onChange(id)}
              >
                <Icon data-icon="inline-start" />
                {label}
                {!available && (
                  <Badge
                    variant="outline"
                    className="ml-auto hidden lg:inline-flex"
                  >
                    Soon
                  </Badge>
                )}
              </Button>
            ))}
        </div>
      ))}
    </nav>
  );
}

function ProfileSettings({ businessOnly = false }: { businessOnly?: boolean }) {
  const storedUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const accountKey = useAccountKey();
  const queryClient = useQueryClient();
  const profileQueryKey = vendorProfileQueryKey(
    accountKey ?? "unresolved-session",
  );
  const profile = useQuery({
    queryKey: profileQueryKey,
    queryFn: settingsService.getProfile,
    enabled: Boolean(accountKey),
    staleTime: 60_000,
  });
  const [fullName, setFullName] = useState(storedUser?.fullName ?? "");
  const [phone, setPhone] = useState(storedUser?.phone ?? "");
  const [location, setLocation] = useState(storedUser?.location ?? "");
  const [avatarUrl, setAvatarUrl] = useState(storedUser?.avatarUrl ?? "");
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (profile.data)
      queueMicrotask(() => {
        setFullName(profile.data.fullName);
        setPhone(profile.data.phone);
        setLocation(profile.data.location);
        setAvatarUrl(profile.data.avatarUrl ?? "");
      });
  }, [profile.data]);
  const save = useMutation({
    mutationFn: () =>
      settingsService.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        location: location.trim(),
      }),
    onSuccess: (updated) => {
      updateUser({
        fullName: updated.fullName || fullName,
        phone: updated.phone || phone,
        location: updated.location || location,
      });
      queryClient.setQueryData<VendorSettingsProfile>(
        profileQueryKey,
        (current) => ({
          ...(current ?? updated),
          ...updated,
          fullName: updated.fullName || fullName,
          phone: updated.phone || phone,
          location: updated.location || location,
        }),
      );
      queryClient.invalidateQueries({ queryKey: ["vendor", "dashboard"] });
      toast.success("Profile saved to your account.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Profile changes could not be saved."),
      ),
  });
  const avatar = useMutation({
    mutationFn: settingsService.updateAvatar,
    onSuccess: (updated) => {
      const next = updated.avatarUrl ?? avatarUrl;
      setAvatarUrl(next);
      updateUser({ avatarUrl: next });
      queryClient.setQueryData<VendorSettingsProfile>(
        profileQueryKey,
        (current) =>
          current ? { ...current, avatarUrl: next } : updated,
      );
      queryClient.invalidateQueries({ queryKey: ["vendor", "dashboard"] });
      toast.success("Profile photo updated.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The profile photo could not be updated."),
      ),
  });
  const chooseAvatar = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type))
      return toast.error("Choose a JPG, PNG, or GIF image.");
    if (file.size > 800 * 1024)
      return toast.error("The image must be 800 KB or smaller.");
    setAvatarUrl(URL.createObjectURL(file));
    avatar.mutate(file);
  };
  const initials =
    fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "PA";
  if (profile.isLoading)
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  if (profile.isError || !profile.data)
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader className="text-center">
          <CardTitle>Profile settings could not be loaded</CardTitle>
          <CardDescription>
            {getApiErrorMessage(
              profile.error,
              "Please check the backend connection and try again.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Button onClick={() => profile.refetch()}>Try again</Button>
        </CardContent>
      </Card>
    );
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {businessOnly ? "Business Information" : "Account Overview"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {businessOnly
              ? "Manage the contact details displayed for your vendor account."
              : "Update your personal details and profile photo."}
          </p>
        </div>
        <Button
          disabled={save.isPending || !fullName.trim()}
          onClick={() => save.mutate()}
        >
          {save.isPending && (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          )}
          Save Changes
        </Button>
      </header>
      {!businessOnly && (
        <Card>
          <CardContent className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Avatar className="size-24 rounded-2xl">
              <AvatarImage
                src={avatarUrl}
                alt={fullName}
                className="rounded-2xl object-cover"
              />
              <AvatarFallback className="rounded-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={avatar.isPending}
                >
                  {avatar.isPending ? "Uploading..." : "Change Photo"}
                </Button>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  onChange={(event) => {
                    chooseAvatar(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, GIF or PNG. Maximum size 800 KB.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <CardHeader>
            <CardTitle>
              {businessOnly ? "Vendor Details" : "Account Information"}
            </CardTitle>
            <CardDescription>
              These details are loaded from your authenticated profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="settings-name">Full Name</FieldLabel>
                <Input
                  id="settings-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </Field>
              <Field data-disabled>
                <FieldLabel htmlFor="settings-email">Email Address</FieldLabel>
                <Input
                  id="settings-email"
                  value={profile.data?.email || storedUser?.email || ""}
                  disabled
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="settings-phone">Phone Number</FieldLabel>
                  <Input
                    id="settings-phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+234"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="settings-location">
                    Business Location
                  </FieldLabel>
                  <Input
                    id="settings-location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="FHA, Lugbe Abuja"
                  />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5" />
              Privacy Guard
            </CardTitle>
            <CardDescription className="text-primary-foreground/75">
              Your authenticated profile is protected in transit and updates are
              saved through the backend.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Authenticated account</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: settingsService.changePassword,
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      toast.success("Password updated successfully.");
    },
    onError: (requestError) =>
      toast.error(
        getApiErrorMessage(requestError, "The password could not be updated."),
      ),
  });
  const submit = () => {
    if (newPassword.length < 8)
      return setError("Use at least eight characters.");
    if (newPassword !== confirm)
      return setError("The new passwords do not match.");
    setError("");
    mutation.mutate({
      currentPassword,
      newPassword,
      confirmNewPassword: confirm,
    });
  };
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Password & Security
        </h1>
        <p className="mt-1 text-muted-foreground">
          Keep your vendor account protected with a strong password.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Password Management</CardTitle>
          <CardDescription>
            The backend securely validates your current password before changing
            it.
          </CardDescription>
          <CardAction>
            <Badge variant="secondary">
              <LockKeyhole data-icon="inline-start" />
              Secure update
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
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
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={Boolean(error)}>
                <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  aria-invalid={Boolean(error)}
                />
              </Field>
              <Field data-invalid={Boolean(error)}>
                <FieldLabel htmlFor="confirm-password">
                  Confirm New Password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  aria-invalid={Boolean(error)}
                />
                <FieldError>{error}</FieldError>
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            disabled={
              mutation.isPending || !currentPassword || !newPassword || !confirm
            }
            onClick={submit}
          >
            {mutation.isPending && (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            )}
            Update Password
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Login Activity</CardTitle>
          <CardDescription>
            Session-history and device-revocation endpoints are not included in
            the current API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-36 items-center justify-center text-center text-muted-foreground">
            Login activity will appear here when backend session tracking is
            available.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  const [settings, setSettings] = useState({
    inquiries: true,
    approval: true,
    appointments: true,
    verification: true,
    marketing: false,
  });
  const rows = [
    {
      key: "inquiries",
      title: "New Lead Inquiries",
      copy: "Alerts when a user requests information about your property.",
    },
    {
      key: "approval",
      title: "Property Approval Status",
      copy: "Updates when a property listing is approved or rejected.",
    },
    {
      key: "appointments",
      title: "Appointment Reminders",
      copy: "Scheduled property viewing reminders.",
    },
    {
      key: "verification",
      title: "Document Verification Updates",
      copy: "Updates when compliance documents are reviewed.",
    },
    {
      key: "marketing",
      title: "Platform Updates & News",
      copy: "Product announcements and vendor tips.",
    },
  ] as const;
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Notification Preferences
        </h1>
        <p className="mt-1 text-muted-foreground">
          Choose how you want to be notified about platform activity.
        </p>
      </header>
      {[
        { title: "Property Alerts", icon: Building2, items: rows.slice(0, 2) },
        { title: "Operational Alerts", icon: Bell, items: rows.slice(2, 4) },
        { title: "Marketing", icon: Megaphone, items: rows.slice(4) },
      ].map(({ title, icon: Icon, items }) => (
        <Card key={title}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {items.map((item, index) => (
              <div key={item.key}>
                {index > 0 && <Separator className="mb-4" />}
                <Field orientation="horizontal">
                  <FieldLabel
                    htmlFor={`notification-${item.key}`}
                    className="flex-1 font-normal"
                  >
                    <span className="font-medium">{item.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.copy}
                    </span>
                  </FieldLabel>
                  <Checkbox
                    id={`notification-${item.key}`}
                    checked={settings[item.key]}
                    onCheckedChange={(checked) =>
                      setSettings((current) => ({
                        ...current,
                        [item.key]: Boolean(checked),
                      }))
                    }
                  />
                </Field>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end">
        <Button
          onClick={() =>
            toast.error(
              "Notification preferences cannot be saved until the backend provides a notification-settings endpoint.",
            )
          }
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

function UnavailableSettings({ section }: { section: Section }) {
  const label =
    sections.find((item) => item.id === section)?.label ?? "Settings";
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>
          This screen is prepared for integration, but the updated API
          collection does not provide an endpoint for it.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-60 flex-col items-center justify-center gap-4 text-center">
        <ShieldCheck className="size-12 text-muted-foreground" />
        <p className="max-w-md text-muted-foreground">
          No changes are stored locally. This feature will become available
          after the backend contract is added.
        </p>
      </CardContent>
    </Card>
  );
}

export function VendorSettings() {
  const [active, setActive] = useState<Section>("profile");
  useEffect(() => {
    const syncSection = () => {
      const section = window.location.hash.slice(1) as Section;
      if (sections.some((item) => item.id === section)) setActive(section);
    };

    syncSection();
    window.addEventListener("hashchange", syncSection);
    return () => window.removeEventListener("hashchange", syncSection);
  }, []);
  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="border-b pb-5 lg:min-h-[calc(100vh-7rem)] lg:border-b-0 lg:border-r lg:pr-6">
        <h2 className="mb-5 text-2xl font-semibold">Settings</h2>
        <SettingsNavigation active={active} onChange={setActive} />
      </aside>
      <main
        className={cn("min-w-0 pb-10", active === "profile" && "max-w-5xl")}
      >
        {active === "profile" && <ProfileSettings />}
        {active === "business" && <ProfileSettings businessOnly />}
        {active === "password" && <PasswordSettings />}
        {active === "notifications" && <NotificationSettings />}
        {["payment", "account"].includes(active) && (
          <UnavailableSettings section={active} />
        )}
      </main>
    </div>
  );
}
