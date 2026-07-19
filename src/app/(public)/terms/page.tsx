import { Footer } from "@/components/shared/footer";
import { PageBanner } from "@/components/shared/page-banner";
import { CONTAINER } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Terms of Service | PropertyArk",
  description:
    "Review the terms that govern your use of PropertyArk's website and services.",
};

export default function TermsPage() {
  return (
    <>
      <PageBanner
        title="Terms of Service"
        description="These Terms of Service govern the use of the PropertyArk platform, website, mobile applications, and related services."
        imageSrc="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1600"
        imageAlt="Business meeting and legal agreement"
      />

      <section className={cn(CONTAINER, "py-20")}>
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card/70 p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Last Updated: July 2026
          </p>

          <div className="mt-8 space-y-8 text-muted-foreground">
            <p className="text-base leading-8">
              These Terms of Service govern the use of the PropertyArk platform,
              website, mobile applications and related services.
            </p>
            <p className="text-base leading-8">
              By accessing or using PropertyArk, you agree to be bound by these
              Terms.
            </p>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                1. ELIGIBILITY
              </h2>
              <p className="mt-4 text-base leading-8">
                Users must be at least 18 years old and capable of entering
                legally binding agreements.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                2. ACCOUNT REGISTRATION
              </h2>
              <p className="mt-4 text-base leading-8">Users agree to:</p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-8">
                <li>Provide accurate information</li>
                <li>Maintain account security</li>
                <li>Keep login credentials confidential</li>
                <li>Notify PropertyArk of unauthorized access</li>
              </ul>
              <p className="mt-4 text-base leading-8">
                Users remain responsible for activities conducted through their
                accounts.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                3. PROPERTY LISTINGS
              </h2>
              <p className="mt-4 text-base leading-8">
                Vendors and agents are responsible for ensuring that all
                listings:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-8">
                <li>Are accurate and truthful</li>
                <li>Do not infringe third-party rights</li>
                <li>Comply with applicable laws</li>
                <li>Reflect genuine and available properties</li>
              </ul>
              <p className="mt-4 text-base leading-8">
                PropertyArk reserves the right to review, reject, suspend, edit,
                or remove listings that violate platform policies.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                4. VERIFICATION AND KYC
              </h2>
              <p className="mt-4 text-base leading-8">
                PropertyArk may require vendors, agents, developers, or service
                providers to complete identity verification and Know Your
                Customer (KYC) processes before accessing certain platform
                features.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                5. PLATFORM ROLE
              </h2>
              <p className="mt-4 text-base leading-8">
                PropertyArk serves as a technology platform connecting users
                within the real estate ecosystem.
              </p>
              <p className="mt-4 text-base leading-8">
                Unless expressly stated otherwise, PropertyArk is not a party to
                property transactions between users and does not guarantee the
                accuracy, quality, ownership, legality, or suitability of any
                property listing.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                6. SUBSCRIPTIONS AND PAYMENTS
              </h2>
              <p className="mt-4 text-base leading-8">
                Certain services may require subscription fees or other
                payments.
              </p>
              <p className="mt-4 text-base leading-8">
                All fees shall be disclosed prior to payment and may be updated
                from time to time.
              </p>
              <p className="mt-4 text-base leading-8">
                Unless otherwise stated, fees paid are non-refundable.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                7. PROHIBITED ACTIVITIES
              </h2>
              <p className="mt-4 text-base leading-8">Users shall not:</p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-8">
                <li>Post false or misleading information</li>
                <li>Engage in fraud or deceptive conduct</li>
                <li>Upload malicious software</li>
                <li>Interfere with platform operations</li>
                <li>Violate intellectual property rights</li>
                <li>Circumvent security measures</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                8. INTELLECTUAL PROPERTY
              </h2>
              <p className="mt-4 text-base leading-8">
                All trademarks, logos, content, software, branding, and platform
                materials belong to PropertyArk or its licensors and are
                protected by applicable laws.
              </p>
              <p className="mt-4 text-base leading-8">
                Users may not copy, reproduce, distribute, or exploit
                PropertyArk content without written permission.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                9. LIMITATION OF LIABILITY
              </h2>
              <p className="mt-4 text-base leading-8">
                To the fullest extent permitted by law, PropertyArk shall not be
                liable for:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-8">
                <li>Property transaction disputes</li>
                <li>Losses arising from third-party conduct</li>
                <li>Inaccuracies in user-submitted content</li>
                <li>Service interruptions beyond reasonable control</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                10. TERMINATION
              </h2>
              <p className="mt-4 text-base leading-8">
                PropertyArk reserves the right to suspend or terminate user
                accounts for violation of these Terms or applicable laws.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                11. FUTURE SERVICES
              </h2>
              <p className="mt-4 text-base leading-8">
                Additional services including mortgage facilitation, escrow
                services, property investment products, and related offerings
                may be introduced subject to separate terms and conditions.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                12. GOVERNING LAW
              </h2>
              <p className="mt-4 text-base leading-8">
                These Terms shall be governed by and interpreted in accordance
                with the laws of the Federal Republic of Nigeria.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                13. CONTACT
              </h2>
              <p className="mt-4 text-base leading-8">
                For inquiries regarding these Terms, please contact:
              </p>
              <p className="mt-4 text-base leading-8">
                PropertyArk
                <br />
                Email:{" "}
                <a
                  href="mailto:info@propertyark.ng"
                  className="text-primary hover:underline"
                >
                  info@propertyark.ng
                </a>
                <br />
                Website:{" "}
                <a
                  href="http://www.propertyark.ng"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  www.propertyark.ng
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
