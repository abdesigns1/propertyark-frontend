import { ShieldCheck, Lock, LineChart } from "lucide-react";
import { StatCounter } from "@/components/motion/stat-counter";

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Verified Sellers Only",
    description:
      "Every listing undergoes a rigorous 50-point inspection and background check to ensure your peace of mind.",
  },
  {
    icon: Lock,
    title: "Secure Transactions",
    description:
      "State-of-the-art encryption and escrow services protect your capital from initial deposit to final closing.",
  },
  {
    icon: LineChart,
    title: "Market Data Insights",
    description:
      "Real-time valuation tools and historical trends help you make data-backed decisions on every property.",
  },
];

const STATS = [
  { value: 98, suffix: "%", label: "Customer Satisfaction" },
  { value: 15, suffix: "k+", label: "Active Investors" },
  {
    value: 2.4,
    prefix: "$",
    suffix: "B+",
    decimals: 1,
    label: "Total Assets Managed",
  },
  { value: 0, suffix: "%", label: "Fraud Incidents" },
];

export function TrustStats() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Built for Trust, Designed for Success
          </h2>
          <div className="mt-8 flex flex-col gap-6">
            {TRUST_POINTS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 self-start">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <p className="font-numeric text-2xl font-bold text-primary sm:text-3xl">
                <StatCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
