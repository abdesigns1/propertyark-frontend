import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PropertyArkMark({
  light = false,
  iconOnly = false,
  className,
}: {
  light?: boolean;
  iconOnly?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="PropertyArk home"
      className={cn(
        "inline-flex items-center",
        iconOnly && "size-9 overflow-hidden rounded-lg",
        className,
      )}
    >
      <Image
        src={
          light
            ? "/property%20arc%20logo-12.png"
            : "/property%20arc%20logo-11.png"
        }
        alt="PropertyArk"
        width={230}
        height={52}
        priority
        className={cn(
          "h-9 w-auto object-contain",
          iconOnly && "max-w-none shrink-0 object-left",
        )}
      />
    </Link>
  );
}
