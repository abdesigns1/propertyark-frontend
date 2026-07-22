import Link from "next/link";
import { ArrowRight, Calculator, Download, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DASHBOARD_ACTIVITIES } from "@/features/dashboard/data/dashboard-data";
import { cn } from "@/lib/utils";
import { AnimatedContainer, AnimatedItem, FadeIn } from "@/components/motion";

const quickActions = [
  { label: "Calculate Mortgage", icon: Calculator },
  { label: "Contact Vendor", icon: Headphones },
  { label: "Download Portfolio Report", icon: Download },
];

export function DashboardActions() {
  return (
    <aside>
      <FadeIn>
        <Card className="gap-4 bg-primary py-5 text-primary-foreground shadow-lg ring-0">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {quickActions.map(({ label, icon: Icon }) => (
              <Button
                key={label}
                variant="outline"
                className="h-auto min-h-14 justify-start border-white/25 bg-white/10 px-4 text-left text-white hover:bg-white/20 hover:text-white"
              >
                <Icon data-icon="inline-start" />
                {label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </FadeIn>
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <AnimatedContainer className="mt-5 flex flex-col">
          {DASHBOARD_ACTIVITIES.map((activity, index) => (
            <AnimatedItem
              key={activity.title}
              className="relative grid grid-cols-[18px_1fr] gap-3 pb-7"
            >
              {index < DASHBOARD_ACTIVITIES.length - 1 && (
                <span className="absolute left-[5px] top-3 h-full w-px bg-border" />
              )}
              <span
                className={cn(
                  "relative mt-1 size-3 rounded-full ring-4 ring-surface",
                  activity.color,
                )}
              />
              <div>
                <h3 className="text-xs font-semibold">{activity.title}</h3>
                <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                  {activity.time}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {activity.text}
                </p>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedContainer>
        <Button variant="ghost" size="sm" className="ml-8" asChild>
          <Link href="#">
            View full activity log <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </section>
    </aside>
  );
}
