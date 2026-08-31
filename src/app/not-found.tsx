import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CircleHelp,
  Home,
  MapPinned,
  SearchX,
} from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CONTAINER, cn } from "@/lib/utils";

const RECOVERY_LINKS = [
  { label: "Help Center", href: "/faq", icon: CircleHelp },
  { label: "Market Insights", href: "/insights", icon: MapPinned },
  { label: "Contact Us", href: "/contact", icon: ArrowRight },
] as const;

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="relative isolate overflow-hidden bg-muted/30 px-0 pb-20 pt-36 sm:pt-40">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-16 -z-10 size-[34rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 bottom-0 -z-10 size-72 rounded-full bg-secondary/15 blur-3xl"
        />

        <section className={cn(CONTAINER, "py-8 sm:py-12")}>
          <Card className="relative isolate gap-0 overflow-hidden py-0 shadow-2xl ring-primary/10 lg:grid lg:grid-cols-[1.15fr_0.85fr]">
            <CardHeader className="p-8 sm:p-12 lg:p-16">
              <Badge variant="secondary" className="mb-3 w-fit">
                Page not found
              </Badge>
              <p className="font-mono text-sm font-semibold tracking-[0.35em] text-primary">
                ERROR 404
              </p>
              <CardTitle className="mt-3 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                This address doesn&apos;t lead anywhere—yet.
              </CardTitle>
              <CardDescription className="mt-5 max-w-xl text-base leading-7">
                The page may have moved, the link may be outdated, or the
                destination might still be under construction. Let&apos;s get
                you back to somewhere useful.
              </CardDescription>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="h-12 px-6 text-base" asChild>
                  <Link href="/">
                    <Home data-icon="inline-start" />
                    Return home
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 text-base"
                  asChild
                >
                  <Link href="/properties">
                    <Building2 data-icon="inline-start" />
                    Browse properties
                  </Link>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="relative flex min-h-80 items-center justify-center overflow-hidden bg-primary p-10 text-primary-foreground lg:min-h-full">
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 size-64 rounded-full border-[44px] border-primary-foreground/5"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-20 -left-20 size-72 rounded-full bg-primary-foreground/5 blur-2xl"
              />
              <div className="relative flex flex-col items-center text-center">
                <div className="flex size-20 items-center justify-center rounded-3xl bg-primary-foreground/15 shadow-xl ring-1 ring-primary-foreground/20">
                  <SearchX aria-hidden="true" className="size-10" />
                </div>
                <p className="mt-7 text-[7rem] font-black leading-none tracking-tighter text-primary-foreground sm:text-[9rem]">
                  404
                </p>
                <p className="mt-3 max-w-xs text-sm leading-6 text-primary-foreground/70">
                  We searched every corner of PropertyArk, but couldn&apos;t
                  find this page.
                </p>
              </div>
            </CardContent>

            <CardFooter className="col-span-2 flex-col items-start justify-between gap-4 px-8 py-6 sm:flex-row sm:items-center sm:px-12">
              <p className="text-sm font-medium">Or continue exploring</p>
              <nav
                aria-label="Helpful destinations"
                className="flex flex-wrap gap-x-5 gap-y-3"
              >
                {RECOVERY_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <item.icon aria-hidden="true" className="size-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </CardFooter>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
