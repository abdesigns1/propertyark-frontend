type GoogleMapsLibrary = "places" | "geocoding" | "streetView";

interface GoogleMapsNamespace {
  importLibrary: (library: GoogleMapsLibrary) => Promise<unknown>;
}

declare global {
  interface Window {
    google?: { maps: GoogleMapsNamespace };
    __propertyArkGoogleMapsReady?: () => void;
  }
}

let loader: Promise<GoogleMapsNamespace> | null = null;

export function getGoogleMapsApiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";
}

export function loadGoogleMaps(): Promise<GoogleMapsNamespace> {
  if (typeof window === "undefined")
    return Promise.reject(
      new Error("Google Maps is only available in the browser."),
    );

  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loader) return loader;

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey)
    return Promise.reject(
      new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured."),
    );

  loader = new Promise((resolve, reject) => {
    const callbackName = "__propertyArkGoogleMapsReady";
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-propertyark-google-maps="true"]',
    );

    window[callbackName] = () => {
      if (window.google?.maps) resolve(window.google.maps);
      else reject(new Error("Google Maps loaded without the Maps namespace."));
      delete window[callbackName];
    };

    if (existing) {
      existing.addEventListener("error", () =>
        reject(new Error("Google Maps could not be loaded.")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&callback=${callbackName}`;
    script.async = true;
    script.dataset.propertyarkGoogleMaps = "true";
    script.onerror = () => {
      loader = null;
      reject(new Error("Google Maps could not be loaded."));
    };
    document.head.appendChild(script);
  });

  return loader;
}
