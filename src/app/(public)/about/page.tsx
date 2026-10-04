import { AboutHero } from "@/components/about/about-hero";
import { WhoWeAre } from "@/components/about/who-we-are";
import { VisionMission } from "@/components/about/vision-mission";
import { CoreValues } from "@/components/about/core-values";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { Footer } from "@/components/shared/footer";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "About PropertyArk",
  description:
    "Learn how PropertyArk uses technology, verification, and transparency to improve property discovery and real estate transactions in Nigeria.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      {/* AboutHero owns this page's dedicated navbar and replaces PageBanner. */}
      <AboutHero />
      <WhoWeAre />
      <VisionMission />
      <CoreValues />
      <CtaBanner />
      <Footer />
    </>
  );
}
