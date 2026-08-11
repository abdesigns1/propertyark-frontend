import { Eye, Rocket } from "lucide-react";

export function VisionMission() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
            <Eye className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Our Vision
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            To become Africa&apos;s most trusted and innovative digital real
            estate marketplace, transforming how people discover, invest in, and
            transact property through technology, transparency and
            accessibility.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Rocket className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Our Mission
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            To simplify property transactions by connecting buyers, sellers,
            tenants, investors, and real estate professionals through a secure,
            transparent and technology-enabled platform that creates value for
            all stakeholders.
          </p>
        </div>
      </div>
    </section>
  );
}
