import { cn } from "@/lib/utils";
import { formatCurrencyParts } from "@/utils/formatters";

interface PriceProps {
  amount: number;
  currency?: "NGN" | "USD";
  className?: string;
}

export function Price({ amount, currency = "NGN", className }: PriceProps) {
  const { symbol, number } = formatCurrencyParts(amount, currency);
  return (
    <span
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
