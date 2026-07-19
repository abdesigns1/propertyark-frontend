import type { Property } from "@/features/properties/types";
import { Price } from "@/components/shared/price";

export function PropertyInformation({ property }: { property: Property }) {
  const rows = [
    [
      {
        label: "Price",
        value: <Price amount={property.price} currency={property.currency} />,
      },
      { label: "Area Size", value: `${property.sizeSqm ?? "—"} Sq Ft` },
      { label: "Rooms", value: property.roomsCount ?? "—" },
      { label: "Year Built", value: property.yearBuilt ?? "—" },
      {
        label: "Land Area Size",
        value: `${property.landSizeSqm ?? "—"} Sq Ft`,
      },
    ],
    [
      { label: "Property ID", value: property.id.toUpperCase() },
      { label: "Bedrooms", value: property.bedrooms },
    ],
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">Information</h2>
      <div className="mt-4 flex flex-col gap-6 rounded-2xl border border-border bg-card p-6">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-2 gap-6 sm:grid-cols-5">
            {row.map((item) => (
              <div key={item.label}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-1 font-numeric text-sm font-semibold text-foreground">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
