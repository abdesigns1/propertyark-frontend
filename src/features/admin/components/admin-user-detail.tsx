"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { VendorProfileSidebar } from "@/features/admin/components/vendor-profile-sidebar";
import { VendorOverviewPanel } from "@/features/admin/components/vendor-overview-panel";
import { UserProfileSidebar } from "@/features/admin/components/user-profile-sidebar";
import { UserOverviewPanel } from "@/features/admin/components/user-overview-panel";
import {
  useAdminUser,
  useAdminVendorProperties,
} from "@/features/admin/hooks/use-admin-dashboard";
import { getVerificationLabel } from "@/features/admin/lib/user-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminUser } from "@/services/admin.service";

export function AdminUserDetail({ userId }: { userId: string }) {
  const userQuery = useAdminUser(userId);
  const user = userQuery.data;
  const vendorPropertiesQuery = useAdminVendorProperties(
    userId,
    user?.role.toUpperCase() === "VENDOR",
  );

  return (
    <AdminWorkspace>
      <main className="mx-auto w-full max-w-[1280px] p-4 sm:p-6 lg:p-8">
        {userQuery.isLoading ? (
          <VendorDetailSkeleton />
        ) : !user ? (
          <MissingProfile />
        ) : user.role.toUpperCase() !== "VENDOR" ? (
          <UserProfile user={user} />
        ) : (
          <>
            <header>
              <Button variant="ghost" asChild className="mb-4 px-0">
                <Link href="/admin/users">
                  <ArrowLeft data-icon="inline-start" />
                  Back to Users
                </Link>
              </Button>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {user.fullName}
                  </h1>
                  <Badge variant={user.isVerified ? "secondary" : "outline"}>
                    <ShieldCheck data-icon="inline-start" />
                    {getVerificationLabel(user)}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" disabled>
                    Edit Profile
                  </Button>
                  <Button onClick={() => window.print()}>
                    Generate Report
                  </Button>
                </div>
              </div>
            </header>

            <div className="mt-7 grid items-start gap-6 lg:grid-cols-[376px_minmax(0,1fr)]">
              <VendorProfileSidebar
                user={user}
                properties={vendorPropertiesQuery.data ?? []}
                propertiesLoading={vendorPropertiesQuery.isLoading}
              />
              <VendorOverviewPanel
                user={user}
                properties={vendorPropertiesQuery.data ?? []}
                propertiesLoading={vendorPropertiesQuery.isLoading}
              />
            </div>
          </>
        )}
      </main>
    </AdminWorkspace>
  );
}

function UserProfile({ user }: { user: AdminUser }) {
  return (
    <>
      <ProfileHeader user={user} />
      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[376px_minmax(0,1fr)]">
        <UserProfileSidebar user={user} />
        <UserOverviewPanel user={user} />
      </div>
    </>
  );
}

function ProfileHeader({ user }: { user: AdminUser }) {
  return (
    <header>
      <Button variant="ghost" asChild className="mb-4 px-0">
        <Link href="/admin/users">
          <ArrowLeft data-icon="inline-start" />
          Back to Users
        </Link>
      </Button>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            {user.fullName}
          </h1>
          <Badge variant={user.isVerified ? "secondary" : "outline"}>
            <ShieldCheck data-icon="inline-start" />
            {getVerificationLabel(user)}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            Edit Profile
          </Button>
          <Button onClick={() => window.print()}>Generate Report</Button>
        </div>
      </div>
    </header>
  );
}

function VendorDetailSkeleton() {
  return (
    <div className="flex flex-col gap-7">
      <Skeleton className="h-12 w-72" />
      <div className="grid gap-6 lg:grid-cols-[376px_minmax(0,1fr)]">
        <Skeleton className="h-[1064px]" />
        <Skeleton className="h-[1050px]" />
      </div>
    </div>
  );
}

function MissingProfile() {
  return (
    <Empty className="min-h-[520px] border">
      <EmptyHeader>
        <EmptyTitle>User not found</EmptyTitle>
        <EmptyDescription>
          This account is no longer present in the administrator dataset.
        </EmptyDescription>
      </EmptyHeader>
      <Button asChild>
        <Link href="/admin/users">
          <ArrowLeft data-icon="inline-start" />
          Back to users
        </Link>
      </Button>
    </Empty>
  );
}
