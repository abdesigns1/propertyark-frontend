import { ShieldCheck, Lightbulb, Eye, Award, Handshake } from "lucide-react";

const CORE_VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust",
    description:
      "We are committed to promoting transparency, credibility and integrity in every interaction on our platform.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We continuously leverage technology to improve the property search, marketing, investment, and transaction experience.",
  },
  {
    icon: Eye,
    title: "Customer Focus",
    description:
      "We place the needs of our users at the center of everything we do.",
  },
  {
    icon: Handshake,
    title: "Collaboration",
    description:
      "We believe in creating meaningful partnerships that drive growth and opportunities within the real estate ecosystem.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "We strive for high standards in service delivery, platform performance and user experience.",
  },
  {
    icon: Award,
    title: "Accountability",
    description:
      "We take responsibility for our actions and remain committed to delivering value to our users and stakeholders.",
  },
];

export function CoreValues() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Our Core Values
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          The foundational principles that guide every decision we make and
          every product we build.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CORE_VALUES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-6 text-left"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-4 text-base font-semibold text-foreground">
                {title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
