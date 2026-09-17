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
            ? "/PropertyArk%20Logo%20Light.png"
            : "/Property%20Ark%20logo%20Dark.png"
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
