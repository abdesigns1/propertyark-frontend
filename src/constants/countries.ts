export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flagUrl: string;
}

function flagUrl(isoCode: string) {
  return `https://flagcdn.com/w40/${isoCode.toLowerCase()}.png`;
}

export const COUNTRIES: Country[] = [
  { code: "NG", name: "Nigeria", dialCode: "+234", flagUrl: flagUrl("ng") },
  { code: "GH", name: "Ghana", dialCode: "+233", flagUrl: flagUrl("gh") },
  { code: "KE", name: "Kenya", dialCode: "+254", flagUrl: flagUrl("ke") },
  { code: "ZA", name: "South Africa", dialCode: "+27", flagUrl: flagUrl("za") },
  { code: "US", name: "United States", dialCode: "+1", flagUrl: flagUrl("us") },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flagUrl: flagUrl("gb"),
  },
];
