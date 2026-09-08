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
  const items = [
    {
      label: "Price",
      value: <Price amount={property.price} currency={property.currency} />,
    },
    { label: "Area size", value: `${property.sizeSqm ?? "—"} Sq Ft` },
    { label: "Rooms", value: property.roomsCount ?? "—" },
    { label: "Year built", value: property.yearBuilt ?? "—" },
    {
      label: "Land area",
      value: `${property.landSizeSqm ?? "—"} Sq Ft`,
    },
    { label: "Bedrooms", value: property.bedrooms },
    { label: "Property ID", value: property.id.toUpperCase(), wide: true },
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
          <div
            key={item.label}
            className={cn(
              "min-w-0",
              compact && item.wide && "col-span-2 border-t pt-5",
            )}
          >
            <p className="text-xs font-medium text-muted-foreground">
              {item.label}
            </p>
            <p
              className={cn(
                "mt-1 font-numeric text-sm font-semibold text-foreground",
                item.wide ? "break-all" : "break-words",
              )}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
