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

interface VendorFutureFeatureProps {
  title: string;
  description: string;
}

export function VendorFutureFeature({
  title,
  description,
}: VendorFutureFeatureProps) {
  return (
    <FadeIn duration={0.45}>
      <Empty className="min-h-[calc(100vh-118px)] gap-0 rounded-none px-5 py-10">
        <ScaleUp>
          <EmptyMedia>
            <Timer
              className="size-32 text-secondary"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          </EmptyMedia>
        </ScaleUp>

        <EmptyHeader className="mt-5 max-w-2xl gap-1.5">
          <EmptyTitle className="text-3xl font-semibold tracking-tight md:text-4xl">
            {title} Features Coming Soon
          </EmptyTitle>
          <EmptyDescription className="max-w-xl text-base leading-7 md:text-lg">
            {description}
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="mt-24 max-w-none flex-col justify-center gap-4 sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            className="h-11 min-w-44 border-secondary text-secondary hover:bg-secondary/10 hover:text-secondary"
            asChild
          >
            <Link href="/vendor/dashboard">Go Home</Link>
          </Button>
          <Button size="lg" className="h-11 min-w-44" asChild>
            <Link href="/properties">Explore Properties</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </FadeIn>
  );
}
