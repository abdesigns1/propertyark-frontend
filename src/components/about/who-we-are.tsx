import Image from "next/image";

export function WhoWeAre() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Who Are We
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            Assisting individuals in locating the appropriate Property.
          </h2>
          <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              PropertyArk is a technology-driven real estate marketplace
              designed to simplify how people discover, market, invest in, and
              transact property across Nigeria and beyond.
            </p>
            <p>
              We connect property owners, developers, real estate agents,
              brokers, investors, tenants, buyers, and service providers through
              a secure and user-friendly digital platform. Our goal is to make
              property transactions more transparent, accessible, and efficient
              by leveraging technology to bridge the gap between property
              seekers and verified property providers.
            </p>
            <p>
              At PropertyArk, we understand the challenges that exist within the
              real estate industry, including information gaps, limited access
              to verified listings, transaction inefficiencies, and trust
              concerns. We are committed to addressing these challenges through
              innovation, transparency and customer-focused solutions.
            </p>
            <p>
              Our platform provides verified property listings, advanced search
              capabilities, vendor onboarding and verification processes,
              subscription-based marketing solutions for property professionals,
              and future-ready services including mortgage facilitation,
              escrow-supported transactions, and property investment
              opportunities.
            </p>
            <p>
              Whether you are searching for your next home, marketing a
              property, exploring investment opportunities, or seeking reliable
              real estate information, PropertyArk is your trusted partner on
              the journey.
            </p>
            <p className="font-semibold text-foreground">
              PropertyArk – Building Trust. Connecting Opportunities. Unlocking
              Possibilities.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative col-span-1 row-span-2 overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800"
              alt="Modern property with pool"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600"
              alt="Cozy bedroom interior"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=600"
              alt="Living room interior"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
