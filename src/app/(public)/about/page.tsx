import { PageBanner } from "@/components/shared/page-banner";
import { WhoWeAre } from "@/components/about/who-we-are";
import { VisionMission } from "@/components/about/vision-mission";
import { CoreValues } from "@/components/about/core-values";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { Footer } from "@/components/shared/footer";

export default function AboutPage() {
  return (
    <>
      <PageBanner
        title="About Us"
        imageSrc="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600"
        imageAlt="Modern residential properties"
      />
      <WhoWeAre />
      <VisionMission />
      <CoreValues />
      <CtaBanner />
      <Footer />
    </>
  );
}
