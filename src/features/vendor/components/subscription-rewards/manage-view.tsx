import {
  Building2,
  Check,
  Cloud,
  CreditCard,
  Download,
  History,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  CURRENCY_FORMATTER,
  CURRENT_PLAN_FEATURES,
  POINT_ACTIVITY,
  RECENT_INVOICES,
  REWARDS,
} from "./data";
import { CapacityCard, SubscriptionPageHeading } from "./shared";

interface ManageViewProps {
  points: number;
  autoRenew: boolean;
  onAutoRenew: (value: boolean) => void;
  onRedeem: (points: number, title: string) => void;
  onPlans: () => void;
  onCheckout: () => void;
}

export function ManageView(props: ManageViewProps) {
  return (
    <>
      <SubscriptionPageHeading
        title="Manage Plan & Loyalty"
        description="Monitor your usage, redeem earned points, and manage billing."
        actions={<HeadingActions onPlans={props.onPlans} />}
      />
      <PlanAndUsage onPlans={props.onPlans} />
      <LoyaltyStatus points={props.points} />
      <Rewards onRedeem={props.onRedeem} />
      <ActivityAndSettings {...props} />
    </>
  );
}

function HeadingActions({ onPlans }: Pick<ManageViewProps, "onPlans">) {
  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        size="lg"
        onClick={() => scrollToSection("payment-history")}
      >
        <History data-icon="inline-start" /> View payment history
      </Button>
      <Button size="lg" onClick={onPlans}>
        Upgrade plan
      </Button>
    </div>
  );
}

function PlanAndUsage({ onPlans }: Pick<ManageViewProps, "onPlans">) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_1.5fr]">
      <CurrentPlanCard onPlans={onPlans} />
      <div className="grid gap-4 sm:grid-cols-2">
        <CapacityCard
          icon={Building2}
          title="Property listings"
          value={72}
          label="18 / 25 used"
        />
        <CapacityCard
          icon={Sparkles}
          title="Featured listings"
          value={60}
          label="3 / 5 used"
          accent
        />
        <StorageUsageCard />
      </div>
    </div>
  );
}

function CurrentPlanCard({ onPlans }: Pick<ManageViewProps, "onPlans">) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary">Current plan</Badge>
          <div className="text-right">
            <p className="font-heading text-lg font-semibold text-primary">
              {CURRENCY_FORMATTER.format(50_000)}
            </p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
        </div>
        <CardTitle className="text-xl">Professional Vendor Plan</CardTitle>
        <CardDescription className="flex items-center gap-2 text-primary">
          <span className="size-2 rounded-full bg-primary" /> Active
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {CURRENT_PLAN_FEATURES.map((feature) => (
          <div key={feature} className="flex items-center gap-3">
            <Check className="size-5 rounded-full bg-primary p-1 text-primary-foreground" />
            <span>{feature}</span>
          </div>
        ))}
        <Separator />
        <p className="text-sm text-muted-foreground">
          Next billing date:{" "}
          <span className="font-medium text-foreground">July 12, 2026</span>
        </p>
      </CardContent>
      <CardFooter className="bg-transparent pt-0">
        <Button
          className="w-full"
          variant="secondary"
          onClick={onPlans}
        >
          Change subscription plan
        </Button>
      </CardFooter>
    </Card>
  );
}

function StorageUsageCard() {
  return (
    <Card className="sm:col-span-2">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Cloud className="size-5 text-primary" />
          <CardTitle>Cloud storage usage</CardTitle>
        </div>
        <CardAction className="text-sm text-muted-foreground">
          2.0 GB of 10.0 GB
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/5 rounded-full bg-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Used for high-resolution property photos and document storage.
        </p>
      </CardContent>
    </Card>
  );
}

function LoyaltyStatus({ points }: Pick<ManageViewProps, "points">) {
  const remainingPoints = Math.max(15_000 - points, 0);
  const progress = Math.min((points / 15_000) * 100, 100);

  return (
    <Card className="border-primary bg-primary text-primary-foreground ring-primary">
      <CardContent className="grid gap-6 py-2 md:grid-cols-[280px_1fr] md:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.15em] text-primary-foreground/70">
            Loyalty status
          </p>
          <div className="mt-2 flex items-end gap-3">
            <p className="font-heading text-4xl font-semibold">
              {points.toLocaleString("en-NG")}
            </p>
            <div className="pb-1">
              <p className="font-semibold text-accent">Points</p>
              <p className="text-sm text-primary-foreground/70">
                Gold Tier Vendor
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm">
            <span className="font-semibold text-accent">
              {remainingPoints.toLocaleString("en-NG")} more points
            </span>{" "}
            to unlock Platinum Tier.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between text-sm">
            <span>Gold Tier (10,000)</span>
            <span>Platinum Tier (15,000)</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-primary-foreground/20">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={() =>
                toast.info(
                  "Earn points through approved listings, verified reviews, and completed bookings.",
                )
              }
            >
              How to earn points
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => scrollToSection("points-history")}
            >
              My rewards history
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Rewards({ onRedeem }: Pick<ManageViewProps, "onRedeem">) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold">
          Redeemable Rewards
        </h2>
        <Button
          variant="link"
          onClick={() =>
            toast.info("All available preview rewards are shown below.")
          }
        >
          View all rewards
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {REWARDS.map(({ title, points, description, icon: Icon }) => (
          <Card key={title} className="h-full">
            <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-accent/30">
              <Icon className="size-20 text-primary/70" aria-hidden="true" />
              <Badge className="absolute bottom-3 left-3 bg-accent text-accent-foreground">
                {points.toLocaleString("en-NG")} points
              </Badge>
            </div>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription className="leading-6">
                {description}
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto border-0 bg-transparent pt-0">
              <Button
                className="w-full"
                onClick={() => onRedeem(points, title)}
              >
                Redeem reward
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ActivityAndSettings(props: ManageViewProps) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1.7fr_0.9fr]">
      <PointActivityTable />
      <div className="flex flex-col gap-4">
        <SubscriptionSettings {...props} />
        <RecentInvoices />
      </div>
    </div>
  );
}

function PointActivityTable() {
  return (
    <Card id="points-history">
      <CardHeader>
        <CardTitle>Point Earning Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Activity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {POINT_ACTIVITY.map(({ activity, status, amount, date }) => (
              <TableRow key={activity}>
                <TableCell className="pl-4 font-medium">{activity}</TableCell>
                <TableCell>
                  <Badge
                    variant={status === "Debited" ? "destructive" : "secondary"}
                  >
                    {status}
                  </Badge>
                </TableCell>
                <TableCell
                  className={
                    amount.startsWith("-") ? "text-destructive" : "text-primary"
                  }
                >
                  {amount}
                </TableCell>
                <TableCell>{date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SubscriptionSettings({
  autoRenew,
  onAutoRenew,
  onCheckout,
}: Pick<ManageViewProps, "autoRenew" | "onAutoRenew" | "onCheckout">) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Settings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Auto-renewal</p>
            <p className="text-sm text-muted-foreground">
              Renews on the 12th of every month
            </p>
          </div>
          <Checkbox
            checked={autoRenew}
            onCheckedChange={(checked) => onAutoRenew(checked === true)}
            aria-label="Toggle automatic renewal"
          />
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
          <CreditCard className="size-8 text-primary" />
          <div className="flex-1">
            <p className="font-medium">Visa ending in 4521</p>
            <p className="text-sm text-muted-foreground">Expires 08/28</p>
          </div>
        </div>
        <Button variant="outline" onClick={onCheckout}>
          Update payment method
        </Button>
      </CardContent>
    </Card>
  );
}

function RecentInvoices() {
  return (
    <Card id="payment-history">
      <CardHeader>
        <CardTitle>Recent invoices</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {RECENT_INVOICES.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-start justify-between gap-3"
          >
            <div>
              <p className="font-medium">{invoice.id}</p>
              <p className="text-sm text-muted-foreground">{invoice.date}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{CURRENCY_FORMATTER.format(50_000)}</p>
              <Badge variant="secondary">Paid</Badge>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() =>
            toast.info(
              "Invoice downloads will be enabled with the subscription API.",
            )
          }
        >
          <Download data-icon="inline-start" /> Download all invoices
        </Button>
      </CardFooter>
    </Card>
  );
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}
