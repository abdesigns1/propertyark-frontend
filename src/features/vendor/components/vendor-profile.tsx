"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Download,
  KeyRound,
  LoaderCircle,
  Mail,
  Pencil,
  ShieldCheck,
  Star,
  Trash2,
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/services/api-error";
import {
  settingsService,
  type VendorSettingsProfile,
} from "@/services/settings.service";
import { useAccountKey } from "@/lib/account-identity";
import { useAuthStore } from "@/store/auth.store";
import { useVendorDashboard } from "@/features/vendor/hooks/use-vendor-dashboard";
import {
  displayProfileValue,
  formatAccountAge,
  formatActivityDate,
  formatCompactCurrency,
  isVerificationComplete,
  profileInitials,
} from "@/features/vendor/lib/vendor-profile-display";

const profileQueryRoot = ["vendor", "settings", "profile"] as const;


export function VendorProfile() {
  const accountKey = useAccountKey();
  const storedUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const queryClient = useQueryClient();
  const dashboard = useVendorDashboard();
  const profile = useQuery({
    queryKey: [...profileQueryRoot, accountKey ?? "unresolved-session"],
    queryFn: settingsService.getProfile,
    enabled: Boolean(accountKey),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
  const [editOpen, setEditOpen] = useState(false);
  const [fullName, setFullName] = useState(storedUser?.fullName ?? "");
  const [phone, setPhone] = useState(storedUser?.phone ?? "");
  const [location, setLocation] = useState(storedUser?.location ?? "");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile.data) return;
    queueMicrotask(() => {
      setFullName(profile.data.fullName);
      setPhone(profile.data.phone);
      setLocation(profile.data.location);
    });
  }, [profile.data]);

  const saveProfile = useMutation({
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
      queryClient.setQueryData(
        [...profileQueryRoot, accountKey ?? "unresolved-session"],
        (current: VendorSettingsProfile | undefined) => ({
          ...(current ?? updated),
          fullName: updated.fullName || fullName,
          phone: updated.phone || phone,
          location: updated.location || location,
          avatarUrl: updated.avatarUrl ?? current?.avatarUrl ?? null,
        }),
      );
      queryClient.invalidateQueries({ queryKey: ["vendor", "dashboard"] });
      setEditOpen(false);
      toast.success("Vendor profile updated successfully.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The profile could not be updated."),
      ),
  });

  const updateAvatar = useMutation({
    mutationFn: settingsService.updateAvatar,
    onSuccess: (updated) => {
      updateUser({ avatarUrl: updated.avatarUrl });
      queryClient.setQueryData<VendorSettingsProfile>(
        [...profileQueryRoot, accountKey ?? "unresolved-session"],
        (current) =>
          current ? { ...current, avatarUrl: updated.avatarUrl } : updated,
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
    if (
      !(["image/jpeg", "image/png", "image/gif"] as string[]).includes(
        file.type,
      )
    ) {
      toast.error("Choose a JPG, PNG, or GIF image.");
      return;
    }
    if (file.size > 800 * 1024) {
      toast.error("The image must be 800 KB or smaller.");
      return;
    }
    updateAvatar.mutate(file);
  };

  if (profile.isLoading) return <VendorProfileSkeleton />;

  if (profile.isError || !profile.data) {
    return (
      <Card className="mx-auto min-h-80 max-w-3xl justify-center text-center">
        <CardHeader>
          <CardTitle>Vendor profile could not be loaded</CardTitle>
          <CardDescription>
            {getApiErrorMessage(
              profile.error,
              "Please check the backend connection and try again.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => profile.refetch()}>Try again</Button>
        </CardContent>
      </Card>
    );
  }

  const data = profile.data;
  const name = data.fullName || storedUser?.fullName || "PropertyArk Vendor";
  const avatarUrl = data.avatarUrl || storedUser?.avatarUrl || "";
  const stats = dashboard.data?.stats;
  const totalResponses =
    (stats?.acceptedInquiries ?? 0) +
    (stats?.pendingInquiries ?? 0) +
    (stats?.declinedInquiries ?? 0);
  const responseRate = totalResponses
    ? Math.round(((stats?.acceptedInquiries ?? 0) / totalResponses) * 100)
    : null;
  const verified = isVerificationComplete(data.identityVerificationStatus);

  const downloadReport = () => {
    const rows = [
      ["Vendor", name],
      ["Email", data.email],
      ["Phone", data.phone],
      ["Location", data.location],
      ["Total properties", String(stats?.totalListings ?? 0)],
      ["Active properties", String(stats?.activeListings ?? 0)],
      ["Pending approval", String(stats?.pendingApproval ?? 0)],
      ["Leads received", String(stats?.leadsReceived ?? 0)],
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "propertyark-vendor-profile-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-7 pb-8">
      <Card className="py-6 lg:py-7">
        <CardContent className="flex flex-col gap-6 px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="relative shrink-0 self-start">
            <Avatar className="size-28 rounded-2xl ring-2 ring-secondary ring-offset-4 ring-offset-background">
              <AvatarImage
                src={avatarUrl}
                alt={name}
                className="rounded-2xl object-cover"
              />
              <AvatarFallback className="rounded-2xl text-2xl">
                {profileInitials(name)}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              size="icon-sm"
              className="absolute -bottom-2 -right-2 rounded-full"
              aria-label="Change profile photo"
              onClick={() => fileInput.current?.click()}
              disabled={updateAvatar.isPending}
            >
              {updateAvatar.isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Pencil />
              )}
            </Button>
            <input
              ref={fileInput}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/gif"
              onChange={(event) => {
                chooseAvatar(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
                {name}
              </h1>
              {verified && (
                <Badge variant="secondary" className="text-success">
                  <BadgeCheck data-icon="inline-start" /> Verified Vendor
                </Badge>
              )}
            </div>
            <p className="mt-2 max-w-2xl text-base leading-6 text-muted-foreground">
              {data.businessDescription ||
                `Authenticated PropertyArk vendor${data.location ? ` based in ${data.location}` : ""}.`}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-6">
              <ProfileStat
                label="Properties"
                value={String(stats?.totalListings ?? 0)}
              />
              <Separator orientation="vertical" className="h-10" />
              <ProfileStat
                label="Total Sales"
                value={formatCompactCurrency(stats?.totalSales ?? 0)}
              />
              <Separator orientation="vertical" className="h-10" />
              <ProfileStat
                label="Rating"
                value={stats?.rating ? `${stats.rating.toFixed(1)} ★` : "—"}
              />
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-48">
            <Button size="lg" onClick={() => setEditOpen(true)}>
              Edit Profile
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-secondary"
              onClick={downloadReport}
            >
              <Download data-icon="inline-start" /> Download Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-7">
          <BusinessInformation
            profile={data}
            onEdit={() => setEditOpen(true)}
          />
          <PublicProfilePreview
            profile={data}
            name={name}
            avatarUrl={avatarUrl}
            rating={stats?.rating ?? 0}
            reviewCount={stats?.reviewCount ?? 0}
            responseRate={responseRate}
            verified={verified}
          />
        </div>
        <aside className="flex flex-col gap-7">
          <VerificationProgress profile={data} />
          <SecurityCard twoFactorEnabled={data.twoFactorEnabled} />
          <NotificationCard profile={data} />
        </aside>
      </div>

      <div className="grid gap-7 xl:grid-cols-2">
        <RecentActivity />
        <AccountManagement />
      </div>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        fullName={fullName}
        phone={phone}
        location={location}
        setFullName={setFullName}
        setPhone={setPhone}
        setLocation={setLocation}
        onSave={() => saveProfile.mutate()}
        saving={saveProfile.isPending}
      />
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-numeric text-2xl font-bold">{value}</p>
    </div>
  );
}

function BusinessInformation({
  profile,
  onEdit,
}: {
  profile: VendorSettingsProfile;
  onEdit: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Business Information</CardTitle>
        <CardAction>
          <Button variant="link" onClick={onEdit}>
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div className="grid gap-5 md:grid-cols-2">
            <ReadOnlyField
              label="CAC Registration Number"
              value={profile.cacRegistrationNumber}
            />
            <ReadOnlyField label="Tax ID (TIN)" value={profile.taxId} />
          </div>
          <ReadOnlyField label="Office Address" value={profile.location} />
          <ReadOnlyField
            label="Company Description"
            value={profile.businessDescription}
            multiline
          />
        </FieldGroup>
        {(!profile.cacRegistrationNumber ||
          !profile.taxId ||
          !profile.businessDescription) && (
          <p className="mt-4 text-xs text-muted-foreground">
            Business registration fields will become editable when the backend
            exposes them.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ReadOnlyField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <Field data-disabled>
      <FieldLabel>{label}</FieldLabel>
      <div
        className={
          multiline
            ? "min-h-24 rounded-lg border bg-surface/50 p-3 leading-6 text-muted-foreground"
            : "flex h-11 items-center rounded-lg border bg-surface/50 px-3 text-muted-foreground"
        }
      >
        {displayProfileValue(value)}
      </div>
    </Field>
  );
}

function PublicProfilePreview({
  profile,
  name,
  avatarUrl,
  rating,
  reviewCount,
  responseRate,
  verified,
}: {
  profile: VendorSettingsProfile;
  name: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  responseRate: number | null;
  verified: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Public Profile Preview</CardTitle>
        <CardAction>
          <span className="text-sm italic text-muted-foreground">
            How users see you
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border bg-surface/40 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar className="size-24">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="text-xl">
                {profileInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-semibold">{name}</h3>
              <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                <Star className="size-4 fill-warning text-warning" />
                <span className="font-semibold text-secondary">
                  {rating ? rating.toFixed(2) : "No rating"}
                </span>
                {reviewCount > 0 && <span>· {reviewCount} reviews</span>}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {verified
                  ? "Identity verified"
                  : "Identity verification pending"}{" "}
                · {formatAccountAge(profile.createdAt)}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              About the vendor
            </p>
            <p className="mt-2 max-w-2xl text-base leading-6">
              {profile.businessDescription ||
                "This vendor has not added a public company description yet."}
            </p>
          </div>
          <Separator className="my-5" />
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileStat
              label="Response rate"
              value={
                responseRate === null ? "Not available" : `${responseRate}%`
              }
            />
            <ProfileStat label="Response time" value="Not available" />
          </div>
          <Button className="mt-6 w-full" variant="secondary" disabled>
            Contact Vendor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VerificationProgress({ profile }: { profile: VendorSettingsProfile }) {
  const rows = [
    ["Identity Verification", profile.identityVerificationStatus],
    ["Business License", profile.businessLicenseStatus],
    ["Tax Certification", profile.taxCertificationStatus],
  ] as const;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
          Verification Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rows.map(([label, status]) => {
          const complete = isVerificationComplete(status);
          return (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl bg-surface/60 p-3"
            >
              {complete ? (
                <CheckCircle2 className="size-5 shrink-0 text-success" />
              ) : (
                <ShieldCheck className="size-5 shrink-0 text-muted-foreground" />
              )}
              <span className="flex-1 font-medium">{label}</span>
              <Badge
                variant={complete ? "secondary" : "outline"}
                className={complete ? "text-success" : "text-muted-foreground"}
              >
                {status.toUpperCase()}
              </Badge>
            </div>
          );
        })}
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          Verification status is read directly from your authenticated profile.
        </p>
      </CardContent>
    </Card>
  );
}

function SecurityCard({
  twoFactorEnabled,
}: {
  twoFactorEnabled: boolean | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Security</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">Two-factor Authentication</p>
            <p className="text-sm text-muted-foreground">
              {twoFactorEnabled === null
                ? "Status unavailable"
                : twoFactorEnabled
                  ? "Enabled"
                  : "Not enabled"}
            </p>
          </div>
          <Badge variant="outline">
            {twoFactorEnabled === null
              ? "Unavailable"
              : twoFactorEnabled
                ? "On"
                : "Off"}
          </Badge>
        </div>
        <Separator className="my-5" />
        <Button variant="ghost" className="w-full justify-between" asChild>
          <Link href="/vendor/settings#password">
            <span className="flex items-center gap-2">
              <KeyRound />
              Change Password
            </span>
            <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function NotificationCard({ profile }: { profile: VendorSettingsProfile }) {
  const rows = [
    ["Email Alerts", profile.emailAlerts],
    ["SMS Notifications", profile.smsNotifications],
    ["Mobile App Push", profile.pushNotifications],
  ] as const;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Notifications</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {rows.map(([label, value]) => (
          <Field key={label} orientation="horizontal" data-disabled>
            <FieldLabel className="font-normal">{label}</FieldLabel>
            <Checkbox
              checked={Boolean(value)}
              disabled
              aria-label={`${label} status`}
            />
          </Field>
        ))}
        <p className="text-xs text-muted-foreground">
          Preferences are read-only until a notification endpoint is available.
        </p>
      </CardContent>
    </Card>
  );
}

function RecentActivity() {
  const dashboard = useVendorDashboard();
  const inquiries = dashboard.data?.inquiries.slice(0, 3) ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Recent Activity</CardTitle>
        <CardDescription>
          Latest activity available from vendor inquiries.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {inquiries.length ? (
          inquiries.map((inquiry) => (
            <div key={inquiry.id} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Mail className="size-4" />
              </span>
              <div>
                <p className="font-semibold">New inquiry received</p>
                <p className="text-sm text-muted-foreground">
                  {inquiry.name} · {inquiry.propertyName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatActivityDate(inquiry.date)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex min-h-28 items-center justify-center text-center text-muted-foreground">
            No recent vendor activity is available yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AccountManagement() {
  return (
    <Card className="ring-destructive/25">
      <CardHeader>
        <CardTitle className="text-2xl text-destructive">
          Account Management
        </CardTitle>
        <CardDescription>
          These actions require vendor self-service endpoints that are not
          present in the current API.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button
          variant="outline"
          className="h-auto justify-between py-4"
          disabled
        >
          <span className="text-left">
            <span className="block font-semibold">Deactivate Account</span>
            <span className="block text-xs font-normal">
              Temporarily hide your properties and profile.
            </span>
          </span>
          <ArrowRight />
        </Button>
        <Button
          variant="destructive"
          className="h-auto justify-between py-4"
          disabled
        >
          <span className="text-left">
            <span className="block font-semibold">Delete Account</span>
            <span className="block text-xs font-normal">
              Permanently remove all data and active listings.
            </span>
          </span>
          <Trash2 />
        </Button>
      </CardContent>
    </Card>
  );
}

function EditProfileDialog({
  open,
  onOpenChange,
  fullName,
  phone,
  location,
  setFullName,
  setPhone,
  setLocation,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fullName: string;
  phone: string;
  location: string;
  setFullName: (value: string) => void;
  setPhone: (value: string) => void;
  setLocation: (value: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Vendor Profile</DialogTitle>
          <DialogDescription>
            These fields are saved through the authenticated profile endpoint.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="vendor-profile-name">Full Name</FieldLabel>
            <Input
              id="vendor-profile-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="vendor-profile-phone">Phone Number</FieldLabel>
            <Input
              id="vendor-profile-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="vendor-profile-location">
              Business Location
            </FieldLabel>
            <Input
              id="vendor-profile-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </Field>
        </FieldGroup>
        <DialogFooter showCloseButton>
          <Button onClick={onSave} disabled={saving || !fullName.trim()}>
            {saving && (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VendorProfileSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-7">
      <Skeleton className="h-56 rounded-xl" />
      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-7">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-[520px] rounded-xl" />
        </div>
        <div className="flex flex-col gap-7">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
