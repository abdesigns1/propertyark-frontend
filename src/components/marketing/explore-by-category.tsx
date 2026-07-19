import Link from "next/link";
import { Mountain, Home, Briefcase, Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  AnimatedItem,
  SlideInTop,
} from "@/components/motion";

const CATEGORIES = [
  {
    label: "Land",
    description: "Raw opportunities",
    href: "/properties?type=land",
    icon: Mountain,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    label: "Rent",
    description: "Family homes",
    href: "/properties?type=rent",
    icon: Home,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "Shortlet",
    description: "Business spaces",
    href: "/properties?type=shortlet",
    icon: Briefcase,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  {
    label: "Sale",
    description: "Elite living",
    href: "/properties?type=sale",
    icon: Gem,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
];

export function ExploreByCategory() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-8">
      <SlideInTop className="text-center">
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Explore by Category
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tailored real estate solutions for every investor and home-seeker.
        </p>
      </SlideInTop>

      <AnimatedContainer className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {CATEGORIES.map(
          ({ label, description, href, icon: Icon, iconBg, iconColor }) => (
            <AnimatedItem key={label}>
              <Link
                href={href}
                className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6 text-center transition-shadow hover:shadow-md"
              >
                <span
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full",
                    iconBg,
                  )}
                >
                  <Icon className={cn("h-6 w-6", iconColor)} />
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              </Link>
            </AnimatedItem>
          ),
        )}
      </AnimatedContainer>
    </section>
  );
}
