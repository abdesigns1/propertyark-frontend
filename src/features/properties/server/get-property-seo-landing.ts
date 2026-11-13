import "server-only";

import { cache } from "react";
import { getAllAvailablePropertiesServer } from "@/features/properties/server/get-available-properties";
import {
  getPropertySeoBackendFilters,
  getPropertySeoDefinition,
  getPropertySeoLanding,
  PROPERTY_SEO_INTENTS,
} from "@/features/properties/seo/property-seo-landings";
import type { PropertySeoLanding } from "@/features/properties/seo/property-seo-landings";
import type { Property } from "@/features/properties/types";

/**
 * Loads a location landing page from the public API using backend filters.
 * The final local match is deliberately retained as a guard against legacy
 * records with inconsistent city/state values or an API that ignores a query.
 */
export const getPropertySeoLandingServer = cache(
  async (locationSlug: string, intentSlug: string) => {
    const definition = getPropertySeoDefinition(locationSlug, intentSlug);
    if (!definition) return null;

    const propertyGroups = await Promise.all(
      getPropertySeoBackendFilters(definition.location, definition.intent).map(
        (filters) => getAllAvailablePropertiesServer(filters),
      ),
    );
    const uniqueProperties = new Map<string, Property>();

    propertyGroups.flat().forEach((property) => {
      uniqueProperties.set(property.id, property);
    });

    return getPropertySeoLanding(
      [...uniqueProperties.values()],
      locationSlug,
      intentSlug,
    );
  },
);

export const getActivePropertySeoLandingsForLocationServer = cache(
  async (locationSlug: string) => {
    const landings = await Promise.all(
      PROPERTY_SEO_INTENTS.map((intent) =>
        getPropertySeoLandingServer(locationSlug, intent.slug),
      ),
    );

    return landings.filter(
      (landing): landing is PropertySeoLanding =>
        landing !== null && landing.properties.length > 0,
    );
  },
);
