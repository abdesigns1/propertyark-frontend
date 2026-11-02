"use client";

import { useState } from "react";
import { BadgeCheck, Building2, House, MapPin } from "lucide-react";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyCard } from "@/features/properties/components/property-card";
import { PublicVendorProfileActions } from "@/features/properties/components/public-vendor-profile-actions";
import type { PublicVendorProfile as PublicVendorProfileData } from "@/features/properties/server/get-available-properties";
import { PURPOSE_LABELS } from "@/features/properties/utils/property-labels";

const PROPERTIES_PER_PAGE = 9;

function profileInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "PA"
  );
}

export function PublicVendorProfile({
  profile,
}: {
  profile: PublicVendorProfileData;
}) {
  const displayName = profile.businessName || profile.name;
  const [propertyPage, setPropertyPage] = useState(1);
  const totalPropertyPages = Math.max(
    1,
    Math.ceil(profile.properties.length / PROPERTIES_PER_PAGE),
  );
  const paginatedProperties = profile.properties.slice(
    (propertyPage - 1) * PROPERTIES_PER_PAGE,
    propertyPage * PROPERTIES_PER_PAGE,
  );
  const firstVisibleProperty =
    profile.properties.length === 0
      ? 0
      : (propertyPage - 1) * PROPERTIES_PER_PAGE + 1;
  const lastVisibleProperty = Math.min(
    propertyPage * PROPERTIES_PER_PAGE,
    profile.properties.length,
  );

  function changePropertyPage(page: number) {
    setPropertyPage(page);
    window.requestAnimationFrame(() => {
      document
        .getElementById("vendor-properties")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <Card className="gap-0 py-0">
        <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[180px_1fr] lg:items-center">
          <Avatar className="size-36 rounded-2xl sm:size-44 [&_[data-slot=avatar-fallback]]:rounded-2xl [&_[data-slot=avatar-image]]:rounded-2xl">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-4xl font-semibold text-primary">
              {profileInitials(profile.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-col gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {displayName}
                </h1>
                {profile.isVerified ? (
                  <Badge variant="success">
                    <BadgeCheck data-icon="inline-start" />
                    Verified Identity
                  </Badge>
                ) : null}
              </div>
              {profile.businessName ? (
                <p className="mt-1 text-base font-medium text-muted-foreground">
                  {profile.name}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
              <span className="inline-flex items-center gap-2">
                <Building2 className="size-4" aria-hidden="true" />
                PropertyArk vendor
              </span>
              {profile.location ? (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4" aria-hidden="true" />
                  {profile.location}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2">
                <House className="size-4" aria-hidden="true" />
                {profile.properties.length}{" "}
                {profile.properties.length === 1 ? "listing" : "listings"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.listingPurposes.map((purpose) => (
                <Badge key={purpose} variant="secondary">
                  {PURPOSE_LABELS[purpose]}
                </Badge>
              ))}
            </div>

            <PublicVendorProfileActions
              vendorId={profile.id}
              vendorName={profile.name}
              phone={profile.phone}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs
        defaultValue="about"
        className="flex w-full flex-col gap-6"
        onValueChange={() => setPropertyPage(1)}
      >
        <TabsList
          variant="primary"
          aria-label="Vendor profile sections"
          className="w-fit justify-start"
        >
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="properties">
            Properties ({profile.properties.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="w-full">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Card>
              <CardHeader>
                <CardTitle>About {displayName}</CardTitle>
                <CardDescription>
                  Learn more about this vendor before making an inquiry.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-base leading-7 text-muted-foreground">
                  {profile.about ||
                    "This vendor has not added an About description yet. You can still review their active listings and contact them through PropertyArk."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Areas served</CardTitle>
                <CardDescription>
                  Based on this vendor&apos;s current public listings.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {profile.serviceAreas.length ? (
                  profile.serviceAreas.map((area) => (
                    <Badge key={area} variant="secondary">
                      <MapPin data-icon="inline-start" />
                      {area}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No service area has been provided yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent
          id="vendor-properties"
          value="properties"
          className="w-full scroll-mt-24"
        >
          {profile.properties.length ? (
            <div className="flex flex-col gap-6">
              <p className="text-sm text-muted-foreground" aria-live="polite">
                Showing {firstVisibleProperty}–{lastVisibleProperty} of{" "}
                {profile.properties.length} properties
              </p>

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {totalPropertyPages > 1 ? (
                <PaginationControls
                  currentPage={propertyPage}
                  totalPages={totalPropertyPages}
                  onPageChange={changePropertyPage}
                />
              ) : null}
            </div>
          ) : (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <House />
                </EmptyMedia>
                <EmptyTitle>No public listings yet</EmptyTitle>
                <EmptyDescription>
                  This vendor does not currently have an available property on
                  PropertyArk.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
