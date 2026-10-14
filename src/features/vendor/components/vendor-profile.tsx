"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Download,
  KeyRound,
  LoaderCircle,
  Mail,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
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
import { useVendorDashboard } from "@/features/vendor/hooks/use-vendor-dashboard";
import { useVendorKyc } from "@/features/vendor/hooks/use-vendor-kyc";
import { useVendorProperties } from "@/features/vendor/hooks/use-vendor-properties";
import {
  formatActivityDate,
  formatCompactCurrency,
  profileInitials,
} from "@/features/vendor/lib/vendor-profile-display";
import type { VendorInquiry } from "@/features/vendor/types";
import { useAccountKey } from "@/lib/account-identity";
import { getApiErrorMessage } from "@/services/api-error";
import {
  settingsService,
  type VendorSettingsProfile,
  vendorProfileQueryKey,
} from "@/services/settings.service";
import type { VendorKycStatus } from "@/services/vendor-kyc.service";
import { useAuthStore } from "@/store/auth.store";

export function VendorProfile() {
  const accountKey = useAccountKey();
  const storedUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const queryClient = useQueryClient();
  const dashboard = useVendorDashboard();
  const vendorProperties = useVendorProperties();
  const kyc = useVendorKyc();
  const profileQueryKey = vendorProfileQueryKey(
    accountKey ?? "unresolved-session",
  );
  const profile = useQuery({
    queryKey: profileQueryKey,
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
        profileQueryKey,
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
        profileQueryKey,
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
              "Your profile could not be loaded. Please try again shortly.",
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
  const name = data.fullName || storedUser?.fullName || "Vendor account";
  const avatarUrl = data.avatarUrl || storedUser?.avatarUrl || "";
  const stats = dashboard.data?.stats;
  const totalProperties = vendorProperties.data
    ? Math.max(
        vendorProperties.data.pagination.total,
        vendorProperties.data.properties.length,
      )
    : (stats?.totalListings ?? 0);
  const verified = kyc.data?.status === "VERIFIED";
  const contactDetails = [data.email, data.location].filter(Boolean);

  const downloadReport = () => {
    const rows = [
      ["Vendor", name],
      ["Email", data.email],
      ["Phone", data.phone],
      ["Location", data.location],
      ["Total properties", String(totalProperties)],
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
                <Badge
                  variant="outline"
                  className="border-success/25 bg-success/10 text-success"
                >
                  <BadgeCheck data-icon="inline-start" /> Verified Vendor
                </Badge>
              )}
            </div>
            {contactDetails.length > 0 && (
              <p className="mt-2 max-w-2xl text-base leading-6 text-muted-foreground">
                {contactDetails.join(" · ")}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-6">
              <ProfileStat
                label="Properties"
                value={
                  vendorProperties.isLoading ? "—" : String(totalProperties)
                }
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
            <Button size="lg" variant="outline" asChild>
              <Link href="/vendor/settings#switch-to-user">
                <UserRound data-icon="inline-start" /> Switch to User
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
        <RecentActivity inquiries={dashboard.data?.inquiries ?? []} />
        <aside className="flex flex-col gap-7">
          <VerificationProgress
            status={kyc.data?.status}
            loading={kyc.isLoading}
          />
          <SecurityCard />
        </aside>
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

const kycStatusLabels: Record<VendorKycStatus, string> = {
  NOT_SUBMITTED: "Not submitted",
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

function VerificationProgress({
  status,
  loading,
}: {
  status?: VendorKycStatus;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
          Identity Verification
        </CardTitle>
        <CardDescription>
          Status from your submitted identity document.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {loading ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-surface/60 p-3">
            <ShieldCheck className="size-5 shrink-0 text-muted-foreground" />
            <span className="flex-1 font-medium">Verification status</span>
            <Badge
              variant="outline"
              className={
                status === "VERIFIED"
                  ? "border-success/25 bg-success/10 text-success"
                  : "text-muted-foreground"
              }
            >
              {status ? kycStatusLabels[status] : "Unavailable"}
            </Badge>
          </div>
        )}
        <Button variant="outline" asChild>
          <Link href="/vendor/kyc-onboarding">
            Review verification
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function SecurityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Security</CardTitle>
        <CardDescription>Manage your account password.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full justify-between" asChild>
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

function RecentActivity({ inquiries }: { inquiries: VendorInquiry[] }) {
  const recentInquiries = inquiries.slice(0, 3);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Recent Activity</CardTitle>
        <CardDescription>
          Latest activity from your property inquiries.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {recentInquiries.length ? (
          recentInquiries.map((inquiry) => (
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
            No inquiry activity is available yet.
          </div>
        )}
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
            Update your personal and contact information.
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
            <FieldLabel htmlFor="vendor-profile-location">Location</FieldLabel>
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
        <Skeleton className="h-80 rounded-xl" />
        <div className="flex flex-col gap-7">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
