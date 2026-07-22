import Link from "next/link";
import { Timer } from "lucide-react";
import { FadeIn, ScaleUp } from "@/components/motion";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface FutureFeatureProps {
  feature: "Mortgage" | "Investment";
}

export function FutureFeature({ feature }: FutureFeatureProps) {
  const description =
    feature === "Investment"
      ? "Our property investment features are coming soon on PropertyArk. You’ll be notified when the feature is live."
      : "Our mortgage feature is coming soon on PropertyArk. You’ll be notified when the feature is live.";

  return (
    <FadeIn duration={0.45}>
      <Empty className="min-h-[calc(100vh-118px)] rounded-[3rem] border border-border bg-card px-5 py-12">
        <ScaleUp>
          <EmptyMedia>
            <Timer
              className="size-32 text-secondary"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          </EmptyMedia>
        </ScaleUp>
        <EmptyHeader className="max-w-2xl gap-2">
          <EmptyTitle className="text-3xl font-semibold tracking-tight md:text-4xl">
            {feature} Features Coming Soon
          </EmptyTitle>
          <EmptyDescription className="max-w-xl text-base leading-7 md:text-lg">
            {description}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="mt-16">
          <Button size="lg" className="min-w-44" asChild>
            <Link href="/buyer/properties">Explore Properties</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </FadeIn>
  );
}
