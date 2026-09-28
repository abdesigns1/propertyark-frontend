import { PageBanner } from "@/components/shared/page-banner";
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
      <PageBanner
        title="About Us"
        imageSrc="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600"
        imageAlt="Modern residential properties"
        videoSrc="https://res.cloudinary.com/wkwqmkrl/video/upload/f_mp4,vc_h264,ac_none,q_auto/v1790183603/VID_20260923_150401_355.mp4"
        scrollTargetId="about-content"
        showOverlay={false}
      />
      <WhoWeAre />
      <VisionMission />
      <CoreValues />
      <CtaBanner />
      <Footer />
    </>
  );
}
