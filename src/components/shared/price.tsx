import { cn } from "@/lib/utils";
import { formatCurrencyParts } from "@/utils/formatters";

interface PriceProps {
  amount: number;
  currency?: "NGN" | "USD";
  className?: string;
}

const COMPACT_PRICE_THRESHOLD = 999_000_000;

export function Price({ amount, currency = "NGN", className }: PriceProps) {
  const shouldCompact = amount > COMPACT_PRICE_THRESHOLD;
  const { symbol, number } = formatCurrencyParts(amount, currency, {
    compact: shouldCompact,
  });
  const exactPrice = formatCurrencyParts(amount, currency);

  return (
    <span
      aria-label={`${exactPrice.symbol}${exactPrice.number}`}
      title={
        shouldCompact ? `${exactPrice.symbol}${exactPrice.number}` : undefined
      }
      className={cn(
        "inline-flex items-baseline gap-0.5 font-sans tabular-nums",
        className,
      )}
    >
      <span>{symbol}</span>
      <span>{number}</span>
    </span>
  );
}
