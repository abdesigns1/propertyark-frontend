import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function DashboardBrand({
  compact = false,
  iconOnly = false,
}: {
  compact?: boolean;
  iconOnly?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="PropertyArk home"
      className={cn("block", iconOnly && "size-9 overflow-hidden rounded-lg")}
    >
      <Image
        src="/property arc logo-11.png"
        alt="PropertyArk"
        width={170}
        height={40}
        className={cn(
          "h-auto w-36",
          compact && "w-32",
          iconOnly && "h-9 w-auto max-w-none object-left",
        )}
        priority
      />
    </Link>
  );
}
