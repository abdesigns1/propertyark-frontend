import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { PublicVendorProfile } from "@/features/properties/components/public-vendor-profile";
import { getPublicVendorProfileServer } from "@/features/properties/server/get-available-properties";
import { CONTAINER, cn } from "@/lib/utils";
import { serializeJsonLd, SITE_URL } from "@/lib/seo";

const getVendorProfile = cache(getPublicVendorProfileServer);

function metadataDescription(name: string, listingCount: number) {
  return `View ${name}'s profile and explore ${listingCount} available ${
    listingCount === 1 ? "property" : "properties"
  } listed on PropertyArk.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const profile = await getVendorProfile(id);
    if (!profile) return { robots: { index: false, follow: false } };

    const displayName = profile.businessName || profile.name;
    const description = metadataDescription(
      displayName,
      profile.properties.length,
    );
    const path = `/vendors/${encodeURIComponent(profile.id)}`;

    return {
      title: `${displayName} — Vendor Profile`,
      description,
      alternates: { canonical: path },
      openGraph: {
        title: `${displayName} — PropertyArk Vendor`,
        description,
        url: path,
        type: "profile",
        images: profile.avatarUrl
          ? [{ url: profile.avatarUrl, alt: displayName }]
          : profile.properties[0]?.images.slice(0, 1),
      },
      twitter: {
        card: "summary_large_image",
        title: `${displayName} — PropertyArk Vendor`,
        description,
        images: profile.avatarUrl
          ? [profile.avatarUrl]
          : profile.properties[0]?.images.slice(0, 1),
      },
    };
  } catch {
    return {
      title: "Vendor profile",
      robots: { index: false, follow: false },
    };
  }
}

export default async function VendorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getVendorProfile(id);
  if (!profile) notFound();
  const displayName = profile.businessName || profile.name;
  const vendorPath = `/vendors/${encodeURIComponent(profile.id)}`;
  const vendorUrl = `${SITE_URL}${vendorPath}`;
  const description =
    profile.about ||
    metadataDescription(displayName, profile.properties.length);
  const profileImage =
    profile.avatarUrl ?? profile.properties[0]?.images[0] ?? undefined;
  const vendorJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${vendorUrl}#profile-page`,
    url: vendorUrl,
    name: `${displayName} — PropertyArk Vendor`,
    description,
    mainEntity: {
      "@type": profile.businessName ? "Organization" : "Person",
      "@id": `${vendorUrl}#vendor`,
      name: displayName,
      alternateName: profile.businessName ? profile.name : undefined,
      url: vendorUrl,
      image: profileImage,
      description,
      address: profile.location
        ? {
            "@type": "PostalAddress",
            addressLocality: profile.location,
            addressCountry: "NG",
          }
        : undefined,
      areaServed: profile.serviceAreas.map((area) => ({
        "@type": "Place",
        name: area,
      })),
      knowsAbout: profile.listingPurposes.map(
        (purpose) => `Property listings for ${purpose}`,
      ),
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Properties",
        item: `${SITE_URL}/properties`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: displayName,
        item: vendorUrl,
      },
    ],
  };

  return (
    <>
      <script
        id="vendor-profile-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(vendorJsonLd) }}
      />
      <script
        id="vendor-profile-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <Navbar reserveSpace />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Properties", href: "/properties" },
          { label: displayName },
        ]}
        style={{ marginTop: "2rem" }}
      />
      <main className={cn(CONTAINER, "py-8 pb-16")}>
        <PublicVendorProfile key={profile.id} profile={profile} />
      </main>
      <Footer />
    </>
  );
}
