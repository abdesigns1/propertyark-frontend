import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { FeaturedProperties } from "@/components/marketing/featured-properties";
import { ExploreByCategory } from "@/components/marketing/explore-by-category";
import { PopularCities } from "@/components/marketing/popular-cities";
import { FeaturedListings } from "@/components/marketing/featured-listings";
import { JourneySteps } from "@/components/marketing/journey-steps";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { Footer } from "@/components/shared/footer";
import { PropertySearchForm } from "@/components/shared/property-search-form";
import { CONTAINER, cn } from "@/lib/utils";
import { HomepageAnnouncementMarquee } from "@/components/shared/site-announcement";
import { WhatsAppChatBubble } from "@/components/shared/whatsapp-chat-bubble";
import { HomepageSeoIntro } from "@/components/marketing/homepage-seo-intro";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Property Listing Website in Nigeria",
  description:
    "Find verified property listings in Nigeria on PropertyArk. Browse houses, apartments, land, commercial properties, rentals, and shortlets from trusted vendors.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <div
        className={cn(
          CONTAINER,
          "relative z-20 -mt-40 max-w-6xl sm:-mt-16 lg:px-8",
        )}
      >
        <PropertySearchForm />
      </div>
      <HomepageAnnouncementMarquee className="mt-8 sm:mt-10" />
      <HomepageSeoIntro />
      <FeaturedListings />
      <ExploreByCategory />
      <FeaturedProperties />
      <PopularCities />
      <JourneySteps />
      <CtaBanner />
      {/* <TrustStats /> */}
      {/* <Testimonials /> */}

      <Footer />
      <WhatsAppChatBubble />
    </>
  );
}
