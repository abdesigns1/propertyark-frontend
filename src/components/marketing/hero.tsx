import Image from "next/image";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/navbar";
import { PropertySearchForm } from "@/components/shared/property-search-form";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-6 pt-4 sm:pb-28">
      {/* Background image + overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/images/hero-property.jpg"
          alt="Modern residential property at dusk"
          fill
          priority
          loading="eager"
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/45 to-slate-950/75" />
      </div>

      <Navbar variant="transparent" />

      <div className="mx-auto mt-20 grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:px-8 lg:mt-20 lg:grid-cols-2 lg:gap-8">
        {/* Left: copy */}
        <div>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Buy, Sell &amp; Rent
            <br />
            <span className="text-secondary">Verified</span> Properties
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/85">
            Discover a curated selection of premium real estate, backed by data
            and verified for your security. Join thousands of investors in the
            next generation of property management.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-2xl bg-primary px-8 py-6 text-primary-foreground hover:bg-primary-hover"
            >
              <Link href="/properties">Browse Properties</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-2xl bg-white px-8 py-6 text-foreground hover:bg-white/90"
            >
              <Link href="/investments">View Investments</Link>
            </Button>
          </div>
        </div>

        {/* Right: property image + stat card */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl border-4 border-white/90 shadow-2xl h-[340px] sm:h-[400px]">
            <Image
              src="https://img.magnific.com/free-photo/house-isolated-field_1303-23773.jpg?semt=ais_test_b&w=740&q=80"
              alt="Featured luxury property"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="eager"
              className="object-cover"
            />
          </div>

          <div className="absolute -bottom-8 left-4 w-64 rounded-xl bg-card p-4 shadow-xl sm:-bottom-10 sm:left-8">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success" />
              Market Activity
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-numeric text-xl font-semibold text-primary">
                +12.4%
              </span>
            </div>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              Avg. ROI for urban luxury apartments this quarter.
            </p>
          </div>
        </div>
      </div>

      {/* Search bar straddling the bottom edge */}
      <div className="relative z-10 mx-auto mt-20 max-w-7xl px-6 sm:mt-20 sm:translate-y-1/2 sm:mt-24">
        <PropertySearchForm />
      </div>
    </section>
  );
}
