import type { Metadata } from "next";
import Link from "next/link";
import { ProfessionalServiceForm } from "@/features/professional-services/components/professional-service-form";
import { PageBanner } from "@/components/shared/page-banner";
import { PropertyCard } from "@/features/properties/components/property-card";
import { BecomeVendorBanner } from "@/components/contact/become-vendor-banner";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { mockProperties } from "@/lib/markupdata";
import { CONTAINER, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Professional Services",
  description:
    "Request trusted accounting, mortgage, legal, or insurance support through PropertyArk.",
};

const SERVICE_VALUES = [
  "accountant",
  "mortgage-broker",
  "legal",
  "insurance",
] as const;

type ServiceValue = (typeof SERVICE_VALUES)[number];

interface ProfessionalServicesPageProps {
  searchParams: Promise<{ service?: string | string[] }>;
}

export default async function ProfessionalServicesPage({
  searchParams,
}: ProfessionalServicesPageProps) {
  const params = await searchParams;
  const requestedService = Array.isArray(params.service)
    ? params.service[0]
    : params.service;
  const initialService: ServiceValue = SERVICE_VALUES.includes(
    requestedService as ServiceValue,
  )
    ? (requestedService as ServiceValue)
    : "accountant";
  const recentlyViewed = mockProperties.slice(3, 6);

  return (
    <>
      <PageBanner
        title="Professional Services"
        imageSrc="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1800"
        imageAlt="Modern homes in a residential neighborhood"
      />

      <section className={cn(CONTAINER, "py-16 sm:py-20")}>
        <ProfessionalServiceForm initialService={initialService} />
      </section>

      <section className={cn(CONTAINER, "pb-20 pt-4")}>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Recently Viewed Properties
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recentlyViewed.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button asChild>
            <Link href="/properties">View All</Link>
          </Button>
        </div>
      </section>

      <BecomeVendorBanner />
      <Footer />
    </>
  );
}
