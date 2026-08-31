import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Property Guides & Blog",
  description: "PropertyArk guides, news, and market education.",
};

export default function BlogPage() {
  notFound();
}
