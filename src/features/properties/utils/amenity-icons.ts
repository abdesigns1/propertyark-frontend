import {
  ArrowUpDown,
  BatteryCharging,
  CarFront,
  CheckCircle2,
  CookingPot,
  Droplets,
  Dumbbell,
  Fan,
  Flame,
  Microwave,
  PawPrint,
  ShieldCheck,
  Snowflake,
  Sofa,
  Trees,
  UtensilsCrossed,
  Video,
  WashingMachine,
  Waves,
  Wifi,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";

type AmenityIconMatch = {
  terms: string[];
  icon: LucideIcon;
};

const AMENITY_ICON_MATCHES: AmenityIconMatch[] = [
  { terms: ["electricity", "power", "light"], icon: Zap },
  { terms: ["generator", "inverter", "solar"], icon: BatteryCharging },
  { terms: ["gym", "fitness", "workout"], icon: Dumbbell },
  { terms: ["pool", "swimming"], icon: Waves },
  { terms: ["water", "borehole"], icon: Droplets },
  { terms: ["aircondition", "airconditioning", "ac"], icon: Snowflake },
  { terms: ["heatextractor", "extractor", "ventilation"], icon: Fan },
  { terms: ["microwave"], icon: Microwave },
  { terms: ["washingmachine", "laundry", "washer"], icon: WashingMachine },
  { terms: ["dryer", "drying"], icon: Wind },
  { terms: ["elevator", "lift"], icon: ArrowUpDown },
  { terms: ["parking", "garage", "carport"], icon: CarFront },
  { terms: ["wifi", "internet", "broadband"], icon: Wifi },
  { terms: ["security", "guard", "gated"], icon: ShieldCheck },
  { terms: ["cctv", "camera", "surveillance"], icon: Video },
  { terms: ["furnished", "furniture", "lounge"], icon: Sofa },
  { terms: ["barbecue", "bbq", "grill"], icon: CookingPot },
  { terms: ["kitchen", "dining"], icon: UtensilsCrossed },
  { terms: ["gas", "fireplace", "heating"], icon: Flame },
  { terms: ["garden", "lawn", "greenarea"], icon: Trees },
  { terms: ["pet", "pets"], icon: PawPrint },
];

function normalizeAmenityName(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getAmenityIcon(amenity: string): LucideIcon {
  const normalizedAmenity = normalizeAmenityName(amenity);
  return (
    AMENITY_ICON_MATCHES.find(({ terms }) =>
      terms.some((term) => normalizedAmenity.includes(term)),
    )?.icon ?? CheckCircle2
  );
}
