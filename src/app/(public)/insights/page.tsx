import type { Metadata } from "next";
import { PageBanner } from "@/components/shared/page-banner";
import { Footer } from "@/components/shared/footer";
import { MarketInsightsDashboard } from "@/features/insights/components/market-insights-dashboard";

export const metadata: Metadata = {
  title: "Property Market Insights",
  description:
    "Explore live PropertyArk listing inventory, asking-price trends, and city-level property market insights.",
};

export default function MarketInsightsPage() {
  return (
    <>
      <PageBanner
        title="Property Market Insights"
        description="A live view of asking prices and available property inventory across the PropertyArk marketplace."
        imageSrc="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600"
        imageAlt="Modern commercial buildings"
      />
      <MarketInsightsDashboard />
      <Footer />
    </>
  );
}
