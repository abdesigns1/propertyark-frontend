import { BedDouble, Bath, Car, Calendar, Ruler } from "lucide-react";
import type { Property } from "@/features/properties/types";

export function PropertyOverview({ property }: { property: Property }) {
  const stats = [
    { icon: BedDouble, value: property.bedrooms, label: "Bedrooms" },
    { icon: Bath, value: property.bathrooms, label: "Bathrooms" },
    { icon: Car, value: property.garageSpaces ?? 0, label: "Garage" },
    { icon: Calendar, value: property.yearBuilt ?? "—", label: "Year Built" },
    { icon: Ruler, value: property.sizeSqm ?? "—", label: "Area Size" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Overview</h2>
        <span className="text-xs text-muted-foreground">
          Property ID: {property.id.toUpperCase()}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-5">
        {stats.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="font-numeric text-base font-semibold text-foreground">
              {value}
            </span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
