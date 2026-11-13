import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarCheck2,
  CircleHelp,
  CreditCard,
  Headphones,
  ShieldCheck,
} from "lucide-react";
import { PageBanner } from "@/components/shared/page-banner";
import { Footer } from "@/components/shared/footer";
import { FaqList, type FaqItem } from "@/components/faq/faq-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CONTAINER, cn } from "@/lib/utils";
import { createPageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "PropertyArk FAQs: Property Listings, Inspections & Shortlets",
  description:
    "Get answers about finding and listing property in Nigeria, vendor verification, inspections, shortlet bookings, payments, and PropertyArk accounts.",
  path: "/faq",
});

const TOPICS = [
  {
    icon: Building2,
    title: "Finding a property",
    description: "Search, saved properties, vendors, and verified listings.",
  },
  {
    icon: CalendarCheck2,
    title: "Bookings & inspections",
    description: "Shortlet dates, inspection requests, and rescheduling.",
  },
  {
    icon: CreditCard,
    title: "Payments & investment",
    description: "Payment records, purchases, and portfolio information.",
  },
  {
    icon: ShieldCheck,
    title: "Safety & accounts",
    description: "Verification, privacy, notifications, and account access.",
  },
] as const;

const FAQS: FaqItem[] = [
  {
    question:
      "How do I find properties for sale or rent in a particular Nigerian city?",
    answer:
      "Use the location field in the homepage search or browse the Property Locations page. You can then refine available listings by purpose, property type, budget, and bedrooms.",
    links: [
      { label: "Browse property locations", href: "/locations" },
      { label: "View all properties", href: "/properties" },
    ],
  },
  {
    question: "How do I list a property for sale or rent in Nigeria?",
    answer:
      "Create a vendor account, complete identity verification, and make sure your credit-point balance covers the current listing charge. From the vendor dashboard, select Add Property, provide accurate details and images, and submit the listing for review. Approved listings are published on the PropertyArk marketplace.",
    links: [
      { label: "Become a PropertyArk vendor", href: "/register?role=vendor" },
    ],
  },
  {
    question: "How do I become a verified PropertyArk vendor?",
    answer:
      "Register as a vendor, or switch an existing user account to Vendor from account settings. Upload a clear, valid government-issued identity document and submit it for review. Once an administrator approves the verification, vendor property-listing tools become available.",
    links: [{ label: "Register as a vendor", href: "/register?role=vendor" }],
  },
  {
    question: "How does vendor identity verification work?",
    answer:
      "PropertyArk accepts a clear JPG, JPEG, or PNG identity document up to 10 MB. The submission remains pending while an administrator reviews it. An approved submission unlocks property creation; if it is rejected, the vendor can review the reason and submit a clearer or valid document.",
  },
  {
    question: "How much does it cost to list a property on PropertyArk?",
    answer:
      "Property listings use PropertyArk credit points. The point price, minimum purchase, listing charge, featured-placement charge, and any vendor bonus are controlled by the platform and can change. Vendors can see the current live rates in Credit Points & Payments before purchasing points or publishing a listing.",
    links: [
      { label: "Create a vendor account", href: "/register?role=vendor" },
    ],
  },
  {
    question: "Can I advertise land, rentals, sales, and shortlets?",
    answer:
      "Yes. Verified vendors can create listings for supported categories such as land, properties for sale, properties for rent, and shortlets. Each submission must contain accurate information and pass the platform review before it becomes publicly available.",
    links: [
      { label: "Explore property categories", href: "/properties" },
      { label: "Become a vendor", href: "/register?role=vendor" },
    ],
  },
  {
    question: "How are property listings reviewed before approval?",
    answer:
      "A PropertyArk administrator reviews the submitted listing details and media, including image quality, address information, pricing, and any supporting documents supplied by the vendor. The listing remains pending until it is approved or rejected, and the vendor can track its status from the property dashboard.",
  },
  {
    question: "How do I contact a property vendor?",
    answer:
      "Open a public property listing to view its vendor information and available contact actions. Depending on the listing, you can call the vendor, send a message through PropertyArk, or request an inspection. You can also open the vendor's public profile to review their other active listings.",
    links: [{ label: "Browse verified properties", href: "/properties" }],
  },
  {
    question: "How do I find verified properties in Lagos or Abuja?",
    answer:
      "Visit Property Locations and select Lagos or Abuja together with the property category you need. Location pages display matching live inventory, such as properties for sale, rent, land, houses, apartments, and shortlets, when those listings are available.",
    links: [
      {
        label: "Properties for sale in Lagos",
        href: "/locations/lagos/properties-for-sale",
      },
      {
        label: "Properties for sale in Abuja",
        href: "/locations/abuja/properties-for-sale",
      },
    ],
  },
  {
    question: "How do I book an inspection?",
    answer:
      "Open a property, choose the inspection option, and submit your preferred date and inspection type. The vendor can accept the request, propose a new time, or decline it. You will receive an in-app notification whenever its status changes.",
    links: [{ label: "Find a property", href: "/properties" }],
  },
  {
    question: "Can a vendor reschedule an inspection?",
    answer:
      "Yes. A vendor can propose a new date and time when the original appointment is no longer convenient. The updated schedule and rescheduled status will appear for both the user and vendor.",
  },
  {
    question: "How are unavailable shortlet dates handled?",
    answer:
      "Dates covered by confirmed bookings or dates manually blocked by the vendor are disabled in the booking calendar. This prevents another guest from requesting an unavailable stay.",
    links: [{ label: "Browse shortlets", href: "/shortlets" }],
  },
  {
    question: "When is a shortlet booking completed?",
    answer:
      "A vendor can check the guest out when the stay ends. If no manual checkout is recorded, the booking service can complete the stay automatically after the configured checkout grace period.",
  },
  {
    question: "Why does PropertyArk verify properties and vendors?",
    answer:
      "Verification helps reduce misleading listings and gives users clearer information about who manages a property. Always review the listing details and complete your due diligence before making a financial commitment.",
  },
  {
    question: "Where can I see my notifications?",
    answer:
      "Signed-in users and vendors can open Notifications from their dashboard sidebar or header bell. There you can filter unread items, open a notification, mark one as read, or mark all as read.",
  },
  {
    question: "Will my purchases appear in my investment portfolio?",
    answer:
      "Eligible completed property purchases and investment transactions can appear in the portfolio once payment and ownership data are connected to the portfolio service.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Use the Contact page to send the PropertyArk team a message. Include the relevant property, booking, inspection, or transaction reference so the team can assist you faster.",
    links: [{ label: "Contact PropertyArk support", href: "/contact" }],
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />
      <PageBanner
        title="PropertyArk Help Center and Property FAQs"
        description="Clear answers about finding and listing property in Nigeria, vendor verification, inspections, payments, and shortlet stays."
        imageSrc="https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1600"
        imageAlt="Modern office support area"
      />

      <main>
        <section className={cn(CONTAINER, "py-16 sm:py-20")}>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CircleHelp aria-hidden="true" className="size-6" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold sm:text-3xl">
              Browse help topics
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Start with a topic or explore the frequently asked questions
              below.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TOPICS.map((topic) => (
              <Card key={topic.title} className="h-full">
                <CardHeader>
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <topic.icon aria-hidden="true" className="size-5" />
                  </div>
                  <CardTitle>{topic.title}</CardTitle>
                  <CardDescription>{topic.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-muted/40 py-16 sm:py-20">
          <div
            className={cn(
              CONTAINER,
              "grid gap-10 lg:grid-cols-[0.72fr_1.28fr]",
            )}
          >
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Frequently asked questions
              </p>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                Frequently Asked Questions About PropertyArk
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                These answers cover the most common questions from buyers,
                renters, shortlet guests, and vendors.
              </p>
            </div>
            <FaqList items={FAQS} />
          </div>
        </section>

        <section className={cn(CONTAINER, "py-16 sm:py-20")}>
          <Card className="relative isolate gap-0 overflow-hidden bg-primary py-0 text-primary-foreground shadow-2xl ring-0 lg:flex-row lg:items-center lg:justify-between">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-28 -z-10 size-80 rounded-full border-[48px] border-primary-foreground/5"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 right-1/3 -z-10 size-56 rounded-full bg-primary-foreground/5 blur-2xl"
            />

            <CardHeader className="relative flex flex-1 flex-row items-start gap-5 p-8 sm:p-10 lg:p-12">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15 shadow-inner ring-1 ring-primary-foreground/20">
                <Headphones aria-hidden="true" className="size-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
                  Personal support
                </p>
                <CardTitle className="mt-2 text-2xl font-semibold sm:text-3xl">
                  Still need a hand?
                </CardTitle>
                <CardDescription className="mt-3 max-w-2xl text-sm leading-6 text-primary-foreground/75 sm:text-base">
                  Send our support team a message and include any relevant
                  property, inspection, or booking reference. We&apos;ll help
                  you find the right next step.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="relative flex shrink-0 flex-col items-start gap-3 px-8 pb-8 sm:px-10 sm:pb-10 lg:items-end lg:py-12 lg:pl-0 lg:pr-12">
              <Button
                variant="secondary"
                size="lg"
                className="h-12 px-6 text-base shadow-lg"
                asChild
              >
                <Link href="/contact">
                  Contact support
                  <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
              <p className="text-xs text-primary-foreground/65">
                Our team will respond as soon as possible.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </>
  );
}
