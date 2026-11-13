import type {
  Property,
  PropertyListingPurpose,
  PropertyType,
} from "@/features/properties/types";

export interface PropertySeoLocation {
  slug: string;
  name: string;
  region: string;
  states?: string[];
  cityOrAddressTerms?: string[];
  backendLocationFilters: Array<{ city?: string; state?: string }>;
}

export interface PropertySeoIntent {
  slug: string;
  heading: string;
  shortLabel: string;
  purposes: PropertyListingPurpose[];
  propertyTypes?: PropertyType[];
  backendListingType: string;
  backendPropertyType?: string;
}

export interface PropertySeoBackendFilter {
  city?: string;
  state?: string;
  listingType: string;
  type?: string;
}

export interface PropertySeoLanding {
  location: PropertySeoLocation;
  intent: PropertySeoIntent;
  properties: Property[];
}

export const PROPERTY_SEO_LOCATIONS: PropertySeoLocation[] = [
  {
    slug: "lagos",
    name: "Lagos",
    region: "Lagos State",
    states: ["lagos", "lagos state"],
    backendLocationFilters: [{ state: "Lagos" }],
  },
  {
    slug: "abuja",
    name: "Abuja",
    region: "Federal Capital Territory",
    states: ["fct", "abuja", "federal capital territory"],
    cityOrAddressTerms: ["abuja"],
    backendLocationFilters: [
      { state: "FCT" },
      { state: "Federal Capital Territory" },
    ],
  },
  {
    slug: "port-harcourt",
    name: "Port Harcourt",
    region: "Rivers State",
    cityOrAddressTerms: ["port harcourt", "port-harcourt"],
    backendLocationFilters: [{ city: "Port Harcourt" }],
  },
  {
    slug: "ibadan",
    name: "Ibadan",
    region: "Oyo State",
    cityOrAddressTerms: ["ibadan"],
    backendLocationFilters: [
      { city: "Ibadan" },
      { city: "Ibandan" },
      { city: "Apata Ibadan" },
      { city: "Akobo" },
    ],
  },
  {
    slug: "asaba",
    name: "Asaba",
    region: "Delta State",
    cityOrAddressTerms: ["asaba"],
    backendLocationFilters: [{ city: "Asaba" }],
  },
  {
    slug: "lekki",
    name: "Lekki",
    region: "Lagos State",
    cityOrAddressTerms: ["lekki", "ibeju-lekki", "ibeju lekki"],
    backendLocationFilters: [
      { city: "Lekki" },
      { city: "Ibeju Lekki" },
      // Some older Lekki records use Lagos as their city. The final frontend
      // location check below prevents unrelated Lagos listings leaking in.
      { city: "Lagos" },
    ],
  },
];

export const PROPERTY_SEO_INTENTS: PropertySeoIntent[] = [
  {
    slug: "properties-for-sale",
    heading: "Properties for Sale",
    shortLabel: "For sale",
    purposes: ["sale"],
    backendListingType: "FOR_SALE",
  },
  {
    slug: "properties-for-rent",
    heading: "Properties for Rent",
    shortLabel: "For rent",
    purposes: ["rent"],
    backendListingType: "FOR_RENT",
  },
  {
    slug: "land-for-sale",
    heading: "Land for Sale",
    shortLabel: "Land",
    purposes: ["land"],
    propertyTypes: ["land"],
    backendListingType: "FOR_LAND",
    backendPropertyType: "LAND",
  },
  {
    slug: "shortlets",
    heading: "Shortlet Properties",
    shortLabel: "Shortlets",
    purposes: ["shortlet"],
    backendListingType: "FOR_SHORTLET",
  },
  {
    slug: "apartments-for-rent",
    heading: "Apartments for Rent",
    shortLabel: "Apartments for rent",
    purposes: ["rent"],
    propertyTypes: ["apartment"],
    backendListingType: "FOR_RENT",
    backendPropertyType: "RESIDENTIAL",
  },
  {
    slug: "houses-for-sale",
    heading: "Houses for Sale",
    shortLabel: "Houses for sale",
    purposes: ["sale"],
    propertyTypes: [
      "duplex",
      "bungalow",
      "terrace",
      "detached-house",
      "semi-detached",
    ],
    backendListingType: "FOR_SALE",
    backendPropertyType: "RESIDENTIAL",
  },
];

function normalize(value: string | undefined) {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
}

function matchesLocation(property: Property, location: PropertySeoLocation) {
  const state = normalize(property.location.state);
  const searchableLocation = normalize(
    [property.location.address, property.location.city]
      .filter(Boolean)
      .join(" "),
  );

  return Boolean(
    location.states?.some((candidate) => state === normalize(candidate)) ||
    location.cityOrAddressTerms?.some((candidate) =>
      searchableLocation.includes(normalize(candidate)),
    ),
  );
}

function matchesIntent(property: Property, intent: PropertySeoIntent) {
  const matchesPurpose = intent.purposes.includes(property.purpose);
  const matchesType =
    !intent.propertyTypes || intent.propertyTypes.includes(property.type);
  return matchesPurpose && matchesType;
}

export function propertySeoLandingPath(
  location: PropertySeoLocation,
  intent: PropertySeoIntent,
) {
  return `/locations/${location.slug}/${intent.slug}`;
}

export function propertySeoLandingTitle(
  location: PropertySeoLocation,
  intent: PropertySeoIntent,
) {
  return `${intent.heading} in ${location.name}, Nigeria`;
}

export function propertySeoLandingDescription(
  location: PropertySeoLocation,
  intent: PropertySeoIntent,
  listingCount?: number,
) {
  const inventory = listingCount
    ? ` Browse ${listingCount} currently available ${listingCount === 1 ? "listing" : "listings"}.`
    : "";

  return `${propertySeoLandingTitle(location, intent)} on PropertyArk. Explore verified listings from trusted property vendors across ${location.region}.${inventory}`;
}

export function getPropertySeoDefinition(
  locationSlug: string,
  intentSlug: string,
) {
  const location = PROPERTY_SEO_LOCATIONS.find(
    (candidate) => candidate.slug === locationSlug,
  );
  const intent = PROPERTY_SEO_INTENTS.find(
    (candidate) => candidate.slug === intentSlug,
  );
  return location && intent ? { location, intent } : null;
}

export function getPropertySeoBackendFilters(
  location: PropertySeoLocation,
  intent: PropertySeoIntent,
): PropertySeoBackendFilter[] {
  return location.backendLocationFilters.map((locationFilter) => ({
    ...locationFilter,
    listingType: intent.backendListingType,
    type: intent.backendPropertyType,
  }));
}

export function getPropertySeoLanding(
  properties: Property[],
  locationSlug: string,
  intentSlug: string,
): PropertySeoLanding | null {
  const definition = getPropertySeoDefinition(locationSlug, intentSlug);
  if (!definition) return null;
  const { location, intent } = definition;

  return {
    location,
    intent,
    properties: properties.filter(
      (property) =>
        matchesLocation(property, location) && matchesIntent(property, intent),
    ),
  };
}

export function getActivePropertySeoLandings(properties: Property[]) {
  return PROPERTY_SEO_LOCATIONS.flatMap((location) =>
    PROPERTY_SEO_INTENTS.map((intent) =>
      getPropertySeoLanding(properties, location.slug, intent.slug),
    ).filter((landing): landing is PropertySeoLanding =>
      Boolean(landing && landing.properties.length),
    ),
  );
}
