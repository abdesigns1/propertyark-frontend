import { Hero } from "@/components/marketing/hero";
import { FeaturedProperties } from "@/components/marketing/featured-properties";
import { ExploreByCategory } from "@/components/marketing/explore-by-category";
import { PopularCities } from "@/components/marketing/popular-cities";
import { FeaturedListings } from "@/components/marketing/featured-listings";
import { JourneySteps } from "@/components/marketing/journey-steps";
import { TrustStats } from "@/components/marketing/trust-stats";
import { Testimonials } from "@/components/marketing/testimonials";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { Footer } from "@/components/shared/footer";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProperties />
      <ExploreByCategory />
      <FeaturedListings />
      <PopularCities />
      <JourneySteps />
      <TrustStats />
      <Testimonials />
      <CtaBanner />
      <Footer />
    </>
  );
}
