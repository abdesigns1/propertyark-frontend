"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardActions } from "./dashboard-actions";
import { DashboardOverview } from "./dashboard-overview";
import { RecommendedPropertyCard } from "./recommended-property-card";
import { AnimatedContainer, AnimatedItem, FadeIn, SlideInBottom } from "@/components/motion";
import { useAvailableProperties } from "@/features/properties/hooks/use-available-properties";
import { Skeleton } from "@/components/ui/skeleton";

export function BuyerDashboard() {
  const availableProperties = useAvailableProperties(1, 6);
  const recommendations = availableProperties.data?.properties ?? [];

  return (
    <>
        <DashboardOverview />
        <div className="mt-9 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <section>
            <FadeIn><div className="mb-6 flex items-center justify-between gap-4"><h2 className="text-2xl font-semibold tracking-tight">Recommended Properties</h2><Button variant="link" asChild className="hidden sm:inline-flex"><Link href="/buyer/properties">View all recommendations <ArrowRight data-icon="inline-end" /></Link></Button></div></FadeIn>
            {availableProperties.isLoading ? (
              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-[410px] rounded-xl" />)}</div>
            ) : availableProperties.isError ? (
              <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Recommendations are temporarily unavailable.</p>
            ) : (
              <AnimatedContainer className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{recommendations.map((property, index) => <AnimatedItem key={property.id}><RecommendedPropertyCard property={property} index={index + 1} /></AnimatedItem>)}</AnimatedContainer>
            )}
          </section>
          <SlideInBottom delay={0.1}><DashboardActions /></SlideInBottom>
        </div>
    </>
  );
}
