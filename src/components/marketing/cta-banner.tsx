import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-16">
      <div className="rounded-3xl bg-primary px-6 py-14 text-center sm:px-12">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">
          Ready to find your next investment?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/85">
          Join thousands of elite investors and homeowners today. Access
          exclusive listings that never hit the public market.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            className="h-12 rounded-2xl bg-white px-8 text-base font-semibold text-primary hover:bg-white/90"
          >
            <Link href="/register">Get Started</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-2xl border-white/60 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10"
          >
            <Link href="/contact">Contact Vendor</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
