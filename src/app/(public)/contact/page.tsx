import { PageBanner } from "@/components/shared/page-banner";
import { ContactForm } from "@/features/messages/components/contact-form";
import { ContactInfo } from "@/features/messages/components/contact-info";
import { OfficeMap } from "@/components/contact/office-map";
import { BecomeVendorBanner } from "@/components/contact/become-vendor-banner";
import { Footer } from "@/components/shared/footer";
import { CONTAINER } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  return (
    <>
      <PageBanner
        title="Contact Us"
        description="Whether you have a question, need support, or want to explore how PropertyArk works, our team is ready to connect with you."
        imageSrc="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600"
        imageAlt="Residential neighborhood street"
      />

      <section
        className={cn(
          CONTAINER,
          "grid grid-cols-1 gap-16 py-20 lg:grid-cols-2",
        )}
      >
        <ContactForm />
        <ContactInfo />
      </section>

      <OfficeMap />
      <BecomeVendorBanner />
      <Footer />
    </>
  );
}
