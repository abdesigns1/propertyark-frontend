"use client";

import { useRef, useState } from "react";
import { Map, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getGoogleMapsApiKey, loadGoogleMaps } from "@/lib/google-maps";

interface LatLng {
  lat: () => number;
  lng: () => number;
}
interface GeocoderResult {
  geometry: { location: LatLng };
}
interface Geocoder {
  geocode: (request: {
    address: string;
  }) => Promise<{ results: GeocoderResult[] }>;
}
interface StreetViewService {
  getPanorama: (request: {
    location: LatLng;
    radius: number;
    preference: string;
    source: string;
  }) => Promise<{ data: { location?: { latLng?: LatLng } } }>;
}
type StreetViewPanorama = object;
interface MapsRuntime {
  Geocoder: new () => Geocoder;
  StreetViewService: new () => StreetViewService;
  StreetViewPanorama: new (
    element: HTMLElement,
    options: {
      position: LatLng;
      pov: { heading: number; pitch: number };
      zoom: number;
    },
  ) => StreetViewPanorama;
  StreetViewPreference: { NEAREST: string };
  StreetViewSource: { OUTDOOR: string };
}

export function PropertyStreetView({ address }: { address: string }) {
  const panoramaHost = useRef<HTMLDivElement>(null);
  const panorama = useRef<StreetViewPanorama | null>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "unavailable"
  >("idle");

  const showStreetView = async () => {
    if (!panoramaHost.current) return;
    setStatus("loading");
    try {
      const maps = (await loadGoogleMaps()) as unknown as MapsRuntime & {
        importLibrary: (
          library: "geocoding" | "streetView",
        ) => Promise<unknown>;
      };
      await Promise.all([
        maps.importLibrary("geocoding"),
        maps.importLibrary("streetView"),
      ]);
      const { results } = await new maps.Geocoder().geocode({ address });
      const location = results[0]?.geometry.location;
      if (!location) throw new Error("Address not found");
      const response = await new maps.StreetViewService().getPanorama({
        location,
        radius: 250,
        preference: maps.StreetViewPreference.NEAREST,
        source: maps.StreetViewSource.OUTDOOR,
      });
      const panoramaLocation = response.data.location?.latLng;
      if (!panoramaLocation) throw new Error("Street View not found");
      panorama.current = new maps.StreetViewPanorama(panoramaHost.current, {
        position: panoramaLocation,
        pov: { heading: 0, pitch: 0 },
        zoom: 1,
      });
      setStatus("ready");
    } catch {
      setStatus("unavailable");
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      // The dialog mounts after this state change. This delay also guarantees
      // that Google is contacted only after the visitor requests Street View.
      window.setTimeout(() => void showStreetView(), 0);
      return;
    }
    panorama.current = null;
    setStatus("idle");
  };

  if (!getGoogleMapsApiKey()) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          className="absolute bottom-4 left-4 border border-white/60 bg-white/85 text-foreground shadow-lg backdrop-blur-md hover:bg-white/95"
          onClick={(event) => event.stopPropagation()}
        >
          <ScanSearch data-icon="inline-start" />
          Street View
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-none grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-4 sm:max-w-[calc(100vw-2rem)] sm:p-5">
        <DialogHeader className="pr-8">
          <DialogTitle>Explore the neighbourhood</DialogTitle>
          <DialogDescription>
            Street View is matched from the property&apos;s saved address and
            may show the nearest covered road.
          </DialogDescription>
        </DialogHeader>
        <div className="relative min-h-0 overflow-hidden rounded-xl border bg-muted">
          <div ref={panoramaHost} className="absolute inset-0" />
          {status !== "ready" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex max-w-sm flex-col items-center gap-3 p-8 text-center">
                <ScanSearch
                  className="size-10 text-primary"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">
                  {status === "loading"
                    ? "Finding the nearest Street View…"
                    : "Street View is not available for this address yet. You can still open the address in Google Maps."}
                </p>
                {status === "unavailable" && (
                  <Button type="button" onClick={() => void showStreetView()}>
                    <ScanSearch data-icon="inline-start" />
                    Try again
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        <Button variant="outline" asChild>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Map data-icon="inline-start" />
            Open address in Google Maps
          </a>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
