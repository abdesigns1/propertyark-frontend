"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { DASHBOARD_STATS } from "@/features/dashboard/data/dashboard-data";
import { useBuyerDashboardStats } from "@/features/dashboard/hooks/use-buyer-dashboard-stats";
import { useDashboardUser } from "@/features/dashboard/hooks/use-dashboard-user";
import { cn } from "@/lib/utils";
import { AnimatedContainer, AnimatedItem, FadeIn } from "@/components/motion";

export function DashboardOverview() {
  const user = useDashboardUser();
  const stats = useBuyerDashboardStats();
  const dashboardStats = DASHBOARD_STATS.map((stat) => {
    if (stat.label === "Saved properties") {
      return { ...stat, value: String(stats.savedProperties) };
    }

    if (stat.label === "Active inquiries") {
      return { ...stat, value: String(stats.activeInquiries) };
    }

    return stat;
  });

  return (
    <>
      <FadeIn duration={0.55}>
        <section className="relative flex min-h-56 items-end overflow-hidden rounded-2xl px-6 py-9 text-white md:px-12">
          <Image
            src="/assets/images/hero-property.jpg"
            alt="Modern homes"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 85vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/65" />
          <div className="relative">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Welcome back, {user.firstName}
            </h1>
            <p className="mt-1 text-sm text-white/90 md:text-base">
              Here&apos;s what&apos;s happening with your property search and
              portfolio today.
            </p>
          </div>
        </section>
      </FadeIn>
      <AnimatedContainer
        aria-label="Portfolio summary"
        className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {dashboardStats.map(
          ({ label, value, note, icon: Icon, iconClass, badge }) => (
            <AnimatedItem key={label}>
              <Card className="min-h-44 justify-between py-5 shadow-sm">
                <CardHeader>
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      iconClass,
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <CardAction>
                    {badge ? (
                      <Badge variant="secondary" className="text-[10px]">
                        {note}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {note}
                      </span>
                    )}
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p className="text-sm uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <p className="font-numeric mt-2 text-2xl font-semibold">
                    {value}
                  </p>
                </CardContent>
              </Card>
            </AnimatedItem>
          ),
        )}
      </AnimatedContainer>
    </>
  );
}
