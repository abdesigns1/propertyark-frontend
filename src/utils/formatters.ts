export function formatCurrencyParts(
  amount: number,
  currency: "NGN" | "USD" = "NGN",
) {
  const symbol = currency === "NGN" ? "₦" : "$";
  const number = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
  return { symbol, number };
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-NG", { notation: "compact" }).format(value);
}
