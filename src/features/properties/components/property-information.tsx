import type { Property } from "@/features/properties/types";
import { Price } from "@/components/shared/price";
import { cn } from "@/lib/utils";

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
  ];

  return (
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
  );
}
