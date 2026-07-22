import Image from "next/image";
import Link from "next/link";

export function DashboardBrand() {
  return (
    <Link href="/" aria-label="PropertyArk home" className="block">
      <Image
        src="/property arc logo-11.png"
        alt="PropertyArk"
        width={170}
        height={40}
        className="h-auto w-36"
        priority
      />
    </Link>
  );
}
