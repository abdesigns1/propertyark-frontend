import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialLinks } from "@/components/shared/social-links";

const FOOTER_COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Properties", href: "/properties" },
      // { label: "Investments", href: "/investments" },
      { label: "Market Insights", href: "/insights" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "About Us", href: "/about" },
      // { label: "Pricing", href: "/pricing" },
      { label: "Help Center", href: "/faq" },
      // { label: "Guides & Blog", href: "/blog" },
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
          <form className="flex w-full max-w-md gap-3">
            <Input
              type="email"
              placeholder="Insert your email here"
              className="h-12 border-0 bg-white text-foreground"
            />
            <Button className="h-12 shrink-0 rounded-lg bg-secondary px-6 text-secondary-foreground hover:bg-secondary-hover">
              Subscribe
            </Button>
          </form>
        </div>
      </div>

      {/* Link columns */}
      <div className="bg-card py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
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
                Redefining real estate through technology, transparency, and
                trust. Your premier portal for global property investment.
              </p>
              <div className="mt-4">
                <SocialLinks />
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
            rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
