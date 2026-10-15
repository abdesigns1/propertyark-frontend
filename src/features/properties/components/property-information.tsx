import type { Property } from "@/features/properties/types";
import { Price } from "@/components/shared/price";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PropertyListingDate } from "@/features/properties/components/property-listing-date";
import { MapPin } from "lucide-react";

export function PropertyInformation({
  property,
  compact = false,
  showHeading = true,
}: {
  property: Property;
  compact?: boolean;
  showHeading?: boolean;
}) {
  const formatLabel = (value: string) =>
    value
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const items = [
    {
      label: "Price",
      value: <Price amount={property.price} currency={property.currency} />,
    },
    { label: "Property type", value: formatLabel(property.type) },
    { label: "Listing status", value: formatLabel(property.status) },
    ...(property.roomsCount
      ? [{ label: "Rooms", value: property.roomsCount }]
      : []),
    ...(property.landSizeSqm
      ? [
          {
            label: "Land area",
            value: `${property.landSizeSqm.toLocaleString()} sqm`,
          },
        ]
      : []),
    {
      label: "Furnished",
      value:
        property.furnished === undefined
          ? "Not specified"
          : property.furnished
            ? "Yes"
            : "No",
    },
    ...(property.purpose === "rent"
      ? [
          {
            label: "Rent duration",
            value: property.rentDuration
              ? formatLabel(property.rentDuration.toLowerCase())
              : "Not specified",
          },
        ]
      : []),
    {
      label: "Listed",
      value: <PropertyListingDate date={property.listedAt} />,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        {showHeading && (
          <h2 className="text-lg font-semibold text-foreground">Information</h2>
        )}
        <div
          className={cn(
            "grid grid-cols-2 gap-x-6 gap-y-6",
            showHeading && "mt-4",
            compact
              ? "sm:grid-cols-2"
              : "rounded-2xl border border-border bg-card p-6 sm:grid-cols-5",
          )}
        >
          {items.map((item) => (
            <div key={item.label} className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 break-words font-numeric text-sm font-semibold text-foreground">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {(property.landmarks?.length ?? 0) > 0 && (
        <section aria-labelledby="nearby-landmarks-heading">
          <h2
            id="nearby-landmarks-heading"
            className="text-lg font-semibold text-foreground"
          >
            Nearby landmarks
          </h2>
          <div
            className={cn(
              "mt-4 grid gap-4",
              compact ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {property.landmarks?.map((landmark, index) => (
              <Card key={`${landmark.name}-${index}`} size="sm">
                <CardHeader className="flex flex-row items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <CardTitle className="break-words">
                      {landmark.name}
                    </CardTitle>
                    <CardDescription>Nearby point of interest</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-medium text-muted-foreground">
                    Distance from property
                  </p>
                  <p className="mt-1 font-numeric font-semibold text-foreground">
                    {landmark.distance}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
