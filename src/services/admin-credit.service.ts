import { api } from "@/services/axios";

export interface CreditPointSettings {
  newVendorBonusPoints: number;
  newVendorBonusExpiryDays: number;
  propertyCreationCost: number;
  featurePropertyCost: number;
  featurePropertyDurationDays: number;
  minimumPurchasePoints: number;
  pricePerPoint: number;
  currency: string;
}

type UnknownRecord = Record<string, unknown>;

export const DEFAULT_CREDIT_SETTINGS: CreditPointSettings = {
  newVendorBonusPoints: 10,
  newVendorBonusExpiryDays: 30,
  propertyCreationCost: 5,
  featurePropertyCost: 10,
  featurePropertyDurationDays: 30,
  minimumPurchasePoints: 10,
  pricePerPoint: 500,
  currency: "NGN",
};

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function findSettings(value: unknown): UnknownRecord {
  const root = record(value);
  const data = record(root.data);
  const settings = record(data.settings ?? root.settings);
  return Object.keys(settings).length
    ? settings
    : Object.keys(data).length
      ? data
      : root;
}

function numberFrom(
  source: UnknownRecord,
  key: Exclude<keyof CreditPointSettings, "currency">,
) {
  const value = Number(source[key]);
  return Number.isFinite(value) ? value : DEFAULT_CREDIT_SETTINGS[key];
}

function normalizeSettings(value: unknown): CreditPointSettings {
  const source = findSettings(value);
  return {
    newVendorBonusPoints: numberFrom(source, "newVendorBonusPoints"),
    newVendorBonusExpiryDays: numberFrom(source, "newVendorBonusExpiryDays"),
    propertyCreationCost: numberFrom(source, "propertyCreationCost"),
    featurePropertyCost: numberFrom(source, "featurePropertyCost"),
    featurePropertyDurationDays: numberFrom(
      source,
      "featurePropertyDurationDays",
    ),
    minimumPurchasePoints: numberFrom(source, "minimumPurchasePoints"),
    pricePerPoint: numberFrom(source, "pricePerPoint"),
    currency:
      typeof source.currency === "string" && source.currency.trim()
        ? source.currency.trim().toUpperCase()
        : DEFAULT_CREDIT_SETTINGS.currency,
  };
}

export const adminCreditService = {
  getSettings: async () => {
    const { data } = await api.get("/credit-points/settings");
    return normalizeSettings(data);
  },
  updateSettings: async (settings: CreditPointSettings) => {
    await api.patch("/credit-points/settings", settings);
    return settings;
  },
};
