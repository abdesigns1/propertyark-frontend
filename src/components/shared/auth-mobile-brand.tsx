import Image from "next/image";
import Link from "next/link";

export function AuthMobileBrand() {
  return (
    <Link
      href="/"
      aria-label="PropertyArk home"
      className="mb-8 block w-fit lg:hidden"
    >
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
