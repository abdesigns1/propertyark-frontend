"use client";

import { useEffect, useRef, useState } from "react";
import { Keyboard, MapPin, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { getGoogleMapsApiKey, loadGoogleMaps } from "@/lib/google-maps";

export interface SelectedGoogleAddress {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface AddressComponent {
  longText?: string;
  shortText?: string;
  types: string[];
}

interface SelectedPlace {
  formattedAddress?: string;
  addressComponents?: AddressComponent[];
  fetchFields: (options: { fields: string[] }) => Promise<void>;
}

interface PlaceSelectEvent extends Event {
  placePrediction: { toPlace: () => SelectedPlace };
}

interface PlaceAutocompleteElement extends HTMLElement {
  includedRegionCodes: string[];
  placeholder: string;
}

interface PlacesLibrary {
  PlaceAutocompleteElement: new () => PlaceAutocompleteElement;
}

function componentValue(components: AddressComponent[], ...types: string[]) {
  const component = components.find((candidate) =>
    types.some((type) => candidate.types.includes(type)),
  );
  return component?.longText ?? component?.shortText ?? "";
}

function streetAddress(components: AddressComponent[], fallback: string) {
  const number = componentValue(components, "street_number");
  const route = componentValue(components, "route");
  const subpremise = componentValue(components, "subpremise");
  const premise = componentValue(components, "premise");
  const concise = [number, route, premise, subpremise]
    .filter(Boolean)
    .join(" ");
  return concise || fallback;
}

export function GoogleAddressAutocomplete({
  onSelect,
}: {
  onSelect: (address: SelectedGoogleAddress) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [manual, setManual] = useState(!getGoogleMapsApiKey());
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (manual || !host.current) return;
    let disposed = false;
    let autocomplete: PlaceAutocompleteElement | null = null;

    void loadGoogleMaps()
      .then(async (maps) => {
        const library = (await maps.importLibrary("places")) as PlacesLibrary;
        if (disposed || !host.current) return;

        autocomplete = new library.PlaceAutocompleteElement();
        autocomplete.includedRegionCodes = ["ng"];
        autocomplete.placeholder = "Search for the property street address";
        autocomplete.className = "block w-full";
        // The Google widget otherwise follows the device's dark color scheme.
        autocomplete.style.colorScheme = "light";
        autocomplete.style.backgroundColor = "white";
        autocomplete.style.color = "var(--foreground)";
        autocomplete.addEventListener("gmp-select", async (event) => {
          const place = (event as PlaceSelectEvent).placePrediction.toPlace();
          await place.fetchFields({
            fields: ["formattedAddress", "addressComponents"],
          });
          const components = place.addressComponents ?? [];
          const formattedAddress = place.formattedAddress ?? "";
          onSelect({
            address: streetAddress(components, formattedAddress),
            city: componentValue(
              components,
              "locality",
              "postal_town",
              "sublocality_level_1",
            ),
            state: componentValue(components, "administrative_area_level_1"),
            country: componentValue(components, "country"),
            zipCode: componentValue(components, "postal_code"),
          });
        });
        host.current.replaceChildren(autocomplete);
      })
      .catch(() => {
        if (!disposed) {
          setLoadError("Address suggestions are temporarily unavailable.");
          setManual(true);
        }
      });

    return () => {
      disposed = true;
      autocomplete?.remove();
    };
  }, [manual, onSelect]);

  if (manual)
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 p-3">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Keyboard className="size-4" aria-hidden="true" />
          {loadError || "Enter the property address in the fields below."}
        </span>
        {getGoogleMapsApiKey() && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setManual(false)}
          >
            <Search data-icon="inline-start" />
            Search addresses
          </Button>
        )}
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="size-4 text-primary" aria-hidden="true" />
          Find an address
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setManual(true)}
        >
          Enter manually
        </Button>
      </div>
      <div
        ref={host}
        className="min-h-10 rounded-md border bg-white p-1 text-foreground"
      />
      <FieldDescription>
        Select the closest match, then adjust any address field below if needed.
      </FieldDescription>
    </div>
  );
}
