import { BadgeCheck, ChevronDown, X } from "lucide-react";

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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import {
  CURRENCY_FORMATTER,
  SUBSCRIPTION_FAQS,
  SUBSCRIPTION_PLANS,
} from "./data";
import { SubscriptionPageHeading } from "./shared";
import type { Faq, PlanId } from "./types";

interface PlansViewProps {
  onChoose: (id: PlanId) => void;
  onBack: () => void;
}

export function PlansView({ onChoose, onBack }: PlansViewProps) {
  return (
    <>
      <SubscriptionPageHeading
        title="Choose the Right Plan for Your Growth"
        description="Scale your property business with tools designed for high-performance hospitality. Change plans anytime."
        actions={
          <Button variant="outline" onClick={onBack}>
            Back to plan
          </Button>
        }
      />

      <div className="grid items-stretch gap-6 pt-16 lg:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "relative min-h-[540px]",
              plan.recommended && "overflow-visible ring-2 ring-primary",
            )}
          >
            {plan.recommended && (
              <Badge className="absolute -top-4 left-1/2 h-8 min-w-44 -translate-x-1/2 justify-center rounded-full px-6 text-xs font-semibold uppercase tracking-[0.14em] shadow-sm">
                Recommended
              </Badge>
            )}

            <CardHeader className={cn("pt-4", plan.recommended && "pt-7")}>
              <Badge variant="secondary" className="uppercase tracking-wide">
                {plan.eyebrow}
              </Badge>
              <CardDescription className="pt-3 text-foreground">
                {plan.name}
              </CardDescription>
              <CardTitle className="pt-2 text-3xl">
                {plan.price ? (
                  <>
                    {CURRENCY_FORMATTER.format(plan.price)}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      /mo
                    </span>
                  </>
                ) : (
                  "Custom"
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-5 pt-4">
              {plan.features.map((feature) => (
                <div key={feature} className="flex gap-3">
                  <BadgeCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span className={cn(plan.recommended && "font-medium")}>
                    {feature}
                  </span>
                </div>
              ))}
              {plan.unavailable.map((feature) => (
                <div
                  key={feature}
                  className="flex gap-3 text-muted-foreground/60"
                >
                  <X className="mt-0.5 size-5 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </CardContent>

            <CardFooter className="border-0 bg-transparent">
              <Button
                variant={plan.recommended ? "default" : "outline"}
                size="lg"
                className="w-full"
                onClick={() => onChoose(plan.id)}
              >
                {getPlanActionLabel(plan.id)}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 pt-12 text-center">
        <h2 className="font-heading text-3xl font-semibold">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground">
          Have questions about billing or plans? Our support team is always here
          to help.
        </p>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {SUBSCRIPTION_FAQS.map((faq, index) => (
          <FaqCard key={faq.question} {...faq} defaultOpen={index === 0} />
        ))}
      </div>
    </>
  );
}

function FaqCard({
  question,
  answer,
  defaultOpen,
}: Faq & { defaultOpen?: boolean }) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className="rounded-xl ring-1 ring-foreground/10"
    >
      <CollapsibleTrigger className="flex w-full items-center gap-4 px-6 py-5 text-left font-semibold [&[data-state=open]>svg]:rotate-180">
        <ChevronDown className="size-5 text-primary transition-transform" />
        <span>{question}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-6 pb-6 pl-15 text-sm leading-6 text-muted-foreground">
        {answer}
      </CollapsibleContent>
    </Collapsible>
  );
}

function getPlanActionLabel(planId: PlanId) {
  if (planId === "starter") return "Choose Starter";
  if (planId === "professional") return "Upgrade Now";
  return "Contact Sales";
}
