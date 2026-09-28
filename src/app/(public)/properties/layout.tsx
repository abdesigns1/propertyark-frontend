import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Verified Properties for Sale and Rent in Nigeria",
  description:
    "Browse verified houses, apartments, land, and commercial properties for sale or rent across Nigeria on PropertyArk.",
  path: "/properties",
});

export default function PropertiesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
