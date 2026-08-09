import { CheckCircle2 } from "lucide-react";

export function PropertyAmenities({ amenities }: { amenities: string[] }) {
  if (!amenities.length) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">Amenities</h2>
      <div className="mt-4 flex flex-wrap gap-4 rounded-2xl border border-border bg-card p-6">
        {amenities.map((amenity) => (
          <span
            key={amenity}
            className="flex items-center gap-2 text-sm text-foreground"
          >
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {amenity}
          </span>
        ))}
      </div>
    </div>
  );
}
