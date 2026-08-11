import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, Building2, ShieldCheck } from "lucide-react";
import { AccessRequestForm } from "@/features/admin/components/access-request-form";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export const metadata: Metadata = {
  title: "Staff Access Request | PropertyArk",
};

const steps = [
  {
    icon: BadgeCheck,
    title: "Identity Verification",
    copy: "Your staff ID and department are verified against the HR database.",
  },
  {
    icon: ShieldCheck,
    title: "Admin Review",
    copy: "Your request will be reviewed by a super administrator within 24 hours.",
  },
  {
    icon: Building2,
    title: "Onboarding",
    copy: "Once approved, you'll receive a secure setup link and training modules.",
  },
];

export default function AdminAccessRequestPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="relative min-h-[500px] overflow-hidden px-5 pb-16 pt-8 text-white sm:px-8">
        <Image
          src="/assets/images/hero-property.jpg"
          alt="PropertyArk residential portfolio"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0d2d54]/60" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mt-44 max-w-2xl">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-secondary">
              <ShieldCheck />
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Staff Internal Access Portal
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-white/90 sm:text-lg">
              Welcome to the PropertyArk administration gateway. This portal is
              exclusively for staff members who require elevated privileges to
              manage enterprise property assets.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
        <div className="flex flex-col gap-10">
          <ol className="flex flex-col gap-7">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {index + 1}
                </span>
                <div>
                  <h2 className="font-semibold">{step.title}</h2>
                  <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                    {step.copy}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <figure className="relative min-h-72 overflow-hidden rounded-xl shadow-lg">
            <Image
              src="/assets/images/hero-property.jpeg"
              alt="Modern PropertyArk residential property"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <figcaption className="absolute bottom-5 left-5 text-white">
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                PropertyArk Enterprise
              </span>
              <p className="text-2xl">Building the Future Together</p>
            </figcaption>
          </figure>
        </div>
        <AccessRequestForm />
      </section>

      <Footer />
    </main>
  );
}
