import Image from "next/image";
import { Navbar } from "@/components/shared/navbar";
// import { HeroMarketActivity } from "@/components/marketing/hero-market-activity";

export function Hero() {
  return (
    <>
      <Navbar />

      <section className="relative isolate min-h-[430px] overflow-hidden pb-28 pt-36 sm:min-h-[450px] sm:pt-40 lg:min-h-[470px] lg:pb-36">
        {/* Background image + overlay */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/chuttersnap-hTDbbrT836A-unsplash.jpg"
            alt="Aerial view of a modern city and residential neighbourhood"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_62%] sm:object-[center_58%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/38 via-slate-950/18 to-slate-950/30" />
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center px-6 lg:px-8">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Buy, Sell &amp; Rent
              <br />
              <span className="text-secondary">Verified</span> Properties
            </h1>
            {/* <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-white/85 lg:mx-0">
              Discover a curated selection of premium real estate, backed by
              data and verified for your security. Join thousands of investors
              in the next generation of property management.
            </p> */}
            {/* <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
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
                <Link href={investmentHref}>View Investments</Link>
              </Button>
            </div> */}
          </div>

          {/* Right-side property showcase is temporarily hidden so the search
              form remains visible within the initial viewport.
          <div className="relative">
            <div className="relative h-[340px] overflow-hidden rounded-2xl border-4 border-white/90 shadow-2xl sm:h-[400px]">
              <Image
                src="https://images.unsplash.com/photo-1707074743640-4cd022c3e58c?q=80&w=889&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Featured luxury property"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="eager"
                className="object-cover"
              />
            </div>

            <HeroMarketActivity />
          </div>
          */}
        </div>
      </section>
    </>
  );
}
