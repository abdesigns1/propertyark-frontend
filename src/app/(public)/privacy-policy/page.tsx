import { Footer } from "@/components/shared/footer";
import { PageBanner } from "@/components/shared/page-banner";
import { CONTAINER } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Privacy Policy | PropertyArk",
  description:
    "Learn how PropertyArk collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageBanner
        title="Privacy Policy"
        description="PropertyArk is committed to protecting the privacy and personal information of all users of our website, mobile applications, and related services."
        imageSrc="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600"
        imageAlt="Secure digital privacy concept"
      />

      <section className={cn(CONTAINER, "py-20")}>
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card/70 p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Last Updated: July 2026
          </p>

          <div className="mt-8 space-y-8 text-muted-foreground">
            <p className="text-base leading-8 text-muted-foreground">
              PropertyArk ("PropertyArk", "we", "our", or "us") is committed to
              protecting the privacy and personal information of all users of
              our website, mobile applications, and related services.
            </p>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                1. INFORMATION WE COLLECT
              </h2>
              <p className="mt-4 text-base leading-8">
                We may collect the following information:
              </p>

              <div className="mt-4 space-y-6">
                <div>
                  <p className="font-semibold text-foreground">
                    Personal Information
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-base leading-8">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Telephone number</li>
                    <li>Residential or business address</li>
                    <li>
                      Identification documents submitted during verification
                      processes
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-foreground">
                    Account Information
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-base leading-8">
                    <li>Login credentials</li>
                    <li>User profile information</li>
                    <li>Subscription details</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-foreground">
                    Property Information
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-base leading-8">
                    <li>Property listings</li>
                    <li>Property descriptions</li>
                    <li>Uploaded documents and images</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-foreground">
                    Technical Information
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-base leading-8">
                    <li>IP address</li>
                    <li>Device information</li>
                    <li>Browser information</li>
                    <li>Cookies and usage data</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                2. HOW WE USE YOUR INFORMATION
              </h2>
              <p className="mt-4 text-base leading-8">
                We use information collected to:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-8">
                <li>Create and manage user accounts</li>
                <li>Verify vendors and property listings</li>
                <li>Facilitate communication between users</li>
                <li>Process subscriptions and payments</li>
                <li>Improve platform performance</li>
                <li>Provide customer support</li>
                <li>Comply with legal and regulatory obligations</li>
                <li>
                  Detect and prevent fraud, abuse, and unauthorized activities
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                3. INFORMATION SHARING
              </h2>
              <p className="mt-4 text-base leading-8">
                We do not sell personal information.
              </p>
              <p className="mt-4 text-base leading-8">
                We may share information with:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-8">
                <li>Service providers supporting our operations</li>
                <li>Payment processors</li>
                <li>Regulatory authorities where legally required</li>
                <li>Professional advisers</li>
                <li>Third-party verification providers</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                4. DATA SECURITY
              </h2>
              <p className="mt-4 text-base leading-8">
                We implement reasonable technical and organizational safeguards
                to protect user information from unauthorized access,
                disclosure, alteration, or destruction.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                5. COOKIES
              </h2>
              <p className="mt-4 text-base leading-8">
                We may use cookies and similar technologies to improve user
                experience, analyze usage patterns, and enhance platform
                functionality.
              </p>
              <p className="mt-4 text-base leading-8">
                Users may disable cookies through browser settings, although
                certain platform features may not function properly.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                6. DATA RETENTION
              </h2>
              <p className="mt-4 text-base leading-8">
                We retain personal information only for as long as necessary to
                fulfill legitimate business, legal, regulatory, and operational
                purposes.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                7. USER RIGHTS
              </h2>
              <p className="mt-4 text-base leading-8">
                Subject to applicable laws, users may:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-8">
                <li>Request access to personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of eligible information</li>
                <li>Withdraw consent where applicable</li>
                <li>Lodge complaints regarding privacy concerns</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                8. THIRD-PARTY LINKS
              </h2>
              <p className="mt-4 text-base leading-8">
                PropertyArk may contain links to third-party websites. We are
                not responsible for the privacy practices of external websites.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                9. CHANGES TO THIS POLICY
              </h2>
              <p className="mt-4 text-base leading-8">
                We reserve the right to update this Privacy Policy at any time.
                Updated versions will be published on our platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                10. CONTACT US
              </h2>
              <p className="mt-4 text-base leading-8">
                For privacy-related inquiries, please contact:
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
