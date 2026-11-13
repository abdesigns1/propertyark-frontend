import Link from "next/link";
import Image from "next/image";
import { SocialLinks } from "@/components/shared/social-links";
import { NewsletterSignupForm } from "@/features/newsletter/components/newsletter-signup-form";

const FOOTER_COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Properties", href: "/properties" },
      // { label: "Investments", href: "/investments" },
      { label: "Market Insights", href: "/insights" },
      { label: "Blog", href: "/blog" },
      { label: "Property Locations", href: "/locations" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "About Us", href: "/about" },
      // { label: "Pricing", href: "/pricing" },
      { label: "Help Center", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Legal", href: "/professional-services" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  {
    title: "Popular property searches",
    links: [
      {
        label: "Properties for sale in Lagos",
        href: "/locations/lagos/properties-for-sale",
      },
      {
        label: "Land for sale in Lagos",
        href: "/locations/lagos/land-for-sale",
      },
      {
        label: "Properties for sale in Abuja",
        href: "/locations/abuja/properties-for-sale",
      },
      {
        label: "Land for sale in Abuja",
        href: "/locations/abuja/land-for-sale",
      },
      {
        label: "Shortlets in Abuja",
        href: "/locations/abuja/shortlets",
      },
      {
        label: "Land for sale in Port Harcourt",
        href: "/locations/port-harcourt/land-for-sale",
      },
      {
        label: "Properties for sale in Ibadan",
        href: "/locations/ibadan/properties-for-sale",
      },
      {
        label: "Land for sale in Lekki",
        href: "/locations/lekki/land-for-sale",
      },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t-4 border-primary">
      {/* Newsletter band */}
      <div className="relative overflow-hidden bg-primary py-14">
        <Image
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600"
          alt=""
          fill
          className="object-cover opacity-25"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Join Us
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              Get Property Insights and
              <br />
              Listings Directly to Your Email
            </h3>
            <p className="mt-2 text-sm text-white/75">
              Subscribe to us to get newsletter about property information.
            </p>
          </div>
          <NewsletterSignupForm />
        </div>
      </div>

      {/* Link columns */}
      <div className="bg-card py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Link href="/" className="inline-flex items-center">
                <Image
                  src="/Property%20Ark%20logo%20Dark.png"
                  alt="PropertyArk logo"
                  width={120}
                  height={24}
                  className="h-9 w-auto object-contain"
                  style={{ width: "auto", height: "auto" }}
                />
              </Link>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                PropertyArk is a technology-driven real estate marketplace
                designed to simplify how people discover, market, invest in, and
                transact property across Nigeria and beyond.
              </p>
              <div className="mt-4">
                <SocialLinks variant="footer" />
              </div>
            </div>

            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-foreground">
                  {col.title}
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} PropertyArk Premium Real Estate. All
            rights reserved. | A property of Solinki Global Services Limited.
          </div>
        </div>
      </div>
    </footer>
  );
}
