import { notFound } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Footer } from "@/components/shared/footer";
import { ShortletBookingForm } from "@/features/properties/components/shortlet-booking-form";
import { getAvailablePropertiesServer } from "@/features/properties/server/get-available-properties";
import { CONTAINER, cn } from "@/lib/utils";

export default async function ShortletBookingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string; adults?: string; children?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const { properties } = await getAvailablePropertiesServer();
  const property = properties.find((item) => item.id === id && item.purpose === "shortlet");
  if (!property || !query.checkIn || !query.checkOut) return notFound();
  const guests = Math.min(10, Math.max(1, Number(query.guests) || 1));
  const adults = Math.min(10, Math.max(1, Number(query.adults) || guests));
  const childGuests = Math.min(
    9,
    Math.max(0, Number(query.children) || 0, Math.min(guests - adults, 9)),
  );

  return <><Navbar reserveSpace /><Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Properties", href: "/properties" }, { label: property.title, href: `/properties/${property.id}` }, { label: "Booking" }]} style={{ marginTop: "2rem" }} /><main className={cn(CONTAINER, "py-10 sm:py-14")}><ShortletBookingForm property={property} checkIn={query.checkIn} checkOut={query.checkOut} adults={adults} childGuests={childGuests} /></main><Footer /></>;
}
