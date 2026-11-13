import Link from "next/link";
import { Building2, Home, KeyRound, MapPinned } from "lucide-react";
import { CONTAINER, cn } from "@/lib/utils";

const discoveryLinks = [
  {
    label: "Properties for sale",
    description: "Explore houses, apartments, land, and commercial listings.",
    href: "/properties?purpose=sale",
    icon: Building2,
  },
  {
    label: "Properties for rent",
    description: "Find residential and commercial rentals across Nigeria.",
    href: "/properties?purpose=rent",
    icon: KeyRound,
  },
  {
    label: "Verified shortlets",
    description: "Book flexible furnished stays from trusted vendors.",
    href: "/shortlets",
    icon: Home,
  },
  {
    label: "Browse by location",
    description: "Search available listings in leading Nigerian cities.",
    href: "/properties",
    icon: MapPinned,
  },
] as const;

export function HomepageSeoIntro() {
  return (
    <section
      aria-labelledby="property-marketplace-heading"
      className={cn(CONTAINER, "py-14 sm:py-16")}
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
          Property discovery made clearer
        </p>
        <h2
          id="property-marketplace-heading"
          className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          A trusted property listing website in Nigeria
        </h2>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          PropertyArk connects buyers, renters, investors, and property vendors
          through verified real estate listings across Nigeria. Discover homes,
          apartments, land, commercial properties, and shortlets while viewing
          clear listing details and contacting vendors directly.
        </p>
      </div>

      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {discoveryLinks.map(({ label, description, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border bg-card p-5 transition-[transform,box-shadow,border-color] hover:-translate-y-1 hover:border-primary/30 hover:shadow-md motion-reduce:transform-none"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary">
              {label}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
