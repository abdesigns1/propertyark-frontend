import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BecomeVendorBanner() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-20 pt-8 sm:pt-10">
      <div className="relative flex min-h-[460px] flex-col items-center justify-end overflow-visible rounded-3xl bg-primary px-6 pb-11 pt-72 sm:min-h-[490px] sm:px-10 sm:pt-80 lg:min-h-[248px] lg:flex-row lg:justify-start lg:px-16 lg:py-12 lg:pl-[39%]">
        <div className="absolute -top-10 left-1/2 size-[330px] -translate-x-1/2 sm:size-[370px] lg:bottom-0 lg:left-[5%] lg:top-auto lg:size-[315px] lg:translate-x-0">
          <Image
            src="/Become%20a%20vendor.png"
            alt="Property professional holding a model home"
            fill
            sizes="(max-width: 640px) 330px, (max-width: 1024px) 370px, 315px"
            className="object-contain object-bottom"
          />
        </div>

        <div className="relative flex w-full flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:gap-12 lg:text-left">
          <div className="max-w-xl">
            <h3 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-4xl xl:text-5xl">
              Become a Vendor.
            </h3>
            <p className="mt-4 text-base leading-relaxed text-white/85 sm:text-lg lg:text-base xl:text-lg">
              Want to sell properties with ease?
              <br />
              Sign up now to get started.
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="h-14 shrink-0 rounded-xl bg-white px-10 text-lg font-semibold text-primary shadow-sm hover:bg-white/90"
          >
            <Link href="/register?role=vendor">Register Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
