import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function DashboardBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label="PropertyArk home" className="block">
      <Image
        src="/property arc logo-11.png"
        alt="PropertyArk"
        width={170}
        height={40}
        className={cn("h-auto w-36", compact && "w-32")}
        priority
      />
    </Link>
  );
}
