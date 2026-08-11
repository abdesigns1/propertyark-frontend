import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PropertyArkMark({
  light = false,
  className,
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("inline-flex items-center", className)}>
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
        className="h-9 w-auto object-contain"
      />
    </Link>
  );
}
