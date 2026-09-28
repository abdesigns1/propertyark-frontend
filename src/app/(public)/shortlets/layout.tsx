import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Verified Shortlet Apartments in Nigeria",
  description:
    "Find verified furnished shortlet apartments and flexible stays across Nigeria on PropertyArk.",
  path: "/shortlets",
});

export default function ShortletsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
