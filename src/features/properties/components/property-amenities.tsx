import { getAmenityIcon } from "@/features/properties/utils/amenity-icons";

export function PropertyAmenities({ amenities }: { amenities: string[] }) {
  if (!amenities.length) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">Amenities</h2>
      <div className="mt-4 flex flex-wrap gap-4 rounded-2xl border border-border bg-card p-6">
        {amenities.map((amenity) => {
          const AmenityIcon = getAmenityIcon(amenity);
          return (
            <span
              key={amenity}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <AmenityIcon className="size-4" aria-hidden="true" />
              </span>
              {amenity}
            </span>
          );
        })}
      </div>
    </div>
  );
}
