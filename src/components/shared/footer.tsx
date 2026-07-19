import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FOOTER_COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Properties", href: "/properties" },
      { label: "Investments", href: "/investments" },
      { label: "Market Insights", href: "/insights" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Help Center", href: "/help" },
      { label: "Guides & Blog", href: "/blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Legal", href: "/legal" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.9L4.4 22H1.3l8.2-9.3L1 2h7l4.9 6.3L18.9 2Zm-1.2 18h1.9L7.4 4H5.4l12.3 16Z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

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
                  src="/property%20arc%20logo-11.png"
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
              <div className="mt-4 flex items-center gap-3 text-muted-foreground">
                <FacebookIcon className="h-4 w-4" />
                <TwitterIcon className="h-4 w-4" />
                <InstagramIcon className="h-4 w-4" />
                <Mail className="h-4 w-4" />
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
