"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Banknote,
  Building2,
  Check,
  ChevronDown,
  Cloud,
  CreditCard,
  Crown,
  Download,
  FileChartColumn,
  History,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDashboardUser } from "@/features/dashboard/hooks/use-dashboard-user";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

type View = "manage" | "plans" | "checkout";
type PlanId = "starter" | "professional" | "enterprise";

const plans = [
  {
    id: "starter" as const,
    eyebrow: "Entry level",
    name: "Starter",
    price: 25_000,
    features: ["5 Property Listings", "Basic Analytics Dashboard", "Standard Email Support"],
    unavailable: ["Featured Properties"],
  },
  {
    id: "professional" as const,
    eyebrow: "Growth",
    name: "Professional",
    price: 50_000,
    recommended: true,
    features: [
      "25 Property Listings",
      "Advanced Occupancy Analytics",
      "Lead Management System",
      "3 Featured Property Slots",
      "Priority 24/7 Support",
    ],
    unavailable: [],
  },
  {
    id: "enterprise" as const,
    eyebrow: "At scale",
    name: "Enterprise",
    price: null,
    features: [
      "Unlimited Listings",
      "Multi-user Team Access",
      "Premium Marketplace Visibility",
      "Dedicated Account Manager",
      "API Access & Integration",
    ],
    unavailable: [],
  },
];

const faqs = [
  {
    question: "Can I upgrade or downgrade anytime?",
    answer:
      "Yes. You can change your subscription from your dashboard. Upgrades take effect immediately, while downgrades apply at the end of the billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "The planned checkout supports cards, Paystack, Flutterwave, and bank transfer. Payment processing will be enabled when the subscription API is connected.",
  },
  {
    question: "Are there any hidden fees?",
    answer: "No. The full subscription amount and any applicable tax will be shown before payment.",
  },
  {
    question: "How does featured visibility work?",
    answer:
      "A featured boost moves an eligible property into a higher-visibility placement for the reward period.",
  },
];

const rewards = [
  {
    title: "Featured Property Boost",
    points: 5_000,
    description: "Move any property to the top of search results for 7 consecutive days.",
    icon: Building2,
  },
  {
    title: "Premium Listing Badge",
    points: 10_000,
    description: "Add a premium verification badge to your profile for 30 days.",
    icon: Crown,
  },
  {
    title: "Expert Market Report",
    points: 3_000,
    description: "Receive a focused analytical report for your selected property market.",
    icon: FileChartColumn,
  },
];

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function PageHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {actions}
    </div>
  );
}

function CapacityCard({
  icon: Icon,
  title,
  value,
  label,
  accent = false,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <Card className="min-h-40">
      <CardHeader>
        <div className={cn("flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary", accent && "bg-accent text-accent-foreground")}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <CardAction className="text-sm text-muted-foreground">{value}% capacity</CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="mt-1 text-base font-medium">{label}</p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted" aria-label={`${value}% used`}>
          <div className={cn("h-full rounded-full bg-primary", accent && "bg-accent-foreground")} style={{ width: `${value}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}

export function VendorSubscriptionRewards() {
  const user = useDashboardUser();
  const email = useAuthStore((state) => state.user?.email);
  const [view, setView] = useState<View>("manage");
  const [planId, setPlanId] = useState<PlanId>("professional");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [confirmedBilling, setConfirmedBilling] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);
  const [points, setPoints] = useState(12_450);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === planId) ?? plans[1],
    [planId],
  );

  const choosePlan = (id: PlanId) => {
    if (id === "enterprise") {
      toast.info("Sales contact will be enabled when the subscription service is connected.");
      return;
    }
    setPlanId(id);
    setView("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const completePreview = () => {
    if (!confirmedBilling || !acceptedTerms) {
      toast.error("Please confirm your billing information and accept the subscription terms.");
      return;
    }
    toast.success("Subscription checkout preview completed. No payment was processed.");
    setView("manage");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const redeem = (cost: number, title: string) => {
    if (points < cost) {
      toast.error("You do not have enough points for this reward.");
      return;
    }
    setPoints((current) => current - cost);
    toast.success(`${title} redeemed for this preview session.`);
  };

  return (
    <section className="mx-auto flex w-full max-w-[1220px] flex-col gap-8 pb-12">
      {view === "manage" && (
        <ManageView
          points={points}
          autoRenew={autoRenew}
          onAutoRenew={setAutoRenew}
          onRedeem={redeem}
          onPlans={() => setView("plans")}
          onCheckout={() => setView("checkout")}
        />
      )}
      {view === "plans" && <PlansView onChoose={choosePlan} onBack={() => setView("manage")} />}
      {view === "checkout" && (
        <CheckoutView
          fullName={user.fullName}
          email={email ?? ""}
          plan={selectedPlan}
          paymentMethod={paymentMethod}
          onPaymentMethod={setPaymentMethod}
          confirmedBilling={confirmedBilling}
          acceptedTerms={acceptedTerms}
          onConfirmedBilling={setConfirmedBilling}
          onAcceptedTerms={setAcceptedTerms}
          onPay={completePreview}
          onBack={() => setView("plans")}
        />
      )}
    </section>
  );
}

function ManageView({
  points,
  autoRenew,
  onAutoRenew,
  onRedeem,
  onPlans,
  onCheckout,
}: {
  points: number;
  autoRenew: boolean;
  onAutoRenew: (value: boolean) => void;
  onRedeem: (points: number, title: string) => void;
  onPlans: () => void;
  onCheckout: () => void;
}) {
  return (
    <>
      <PageHeading
        title="Manage Plan & Loyalty"
        description="Monitor your usage, redeem earned points, and manage billing."
        actions={
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => document.getElementById("payment-history")?.scrollIntoView({ behavior: "smooth" })}>
              <History data-icon="inline-start" /> View payment history
            </Button>
            <Button size="lg" onClick={onPlans}>Upgrade plan</Button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_1.5fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <Badge variant="secondary">Current plan</Badge>
              <div className="text-right">
                <p className="font-heading text-lg font-semibold text-primary">{currency.format(50_000)}</p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
            </div>
            <CardTitle className="text-xl">Professional Vendor Plan</CardTitle>
            <CardDescription className="flex items-center gap-2 text-primary"><span className="size-2 rounded-full bg-primary" /> Active</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {["25 Property Listings", "Advanced Lead Management", "Priority 24/7 Support", "Real-time Calendar Sync"].map((feature) => (
              <div key={feature} className="flex items-center gap-3"><Check className="size-5 rounded-full bg-primary p-1 text-primary-foreground" /><span>{feature}</span></div>
            ))}
            <Separator />
            <p className="text-sm text-muted-foreground">Next billing date: <span className="font-medium text-foreground">July 12, 2026</span></p>
          </CardContent>
          <CardFooter className="bg-transparent pt-0">
            <Button className="w-full" variant="secondary" onClick={onPlans}>Change subscription plan</Button>
          </CardFooter>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <CapacityCard icon={Building2} title="Property listings" value={72} label="18 / 25 used" />
          <CapacityCard icon={Sparkles} title="Featured listings" value={60} label="3 / 5 used" accent />
          <Card className="sm:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3"><Cloud className="size-5 text-primary" /><CardTitle>Cloud storage usage</CardTitle></div>
              <CardAction className="text-sm text-muted-foreground">2.0 GB of 10.0 GB</CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-1/5 rounded-full bg-primary" /></div>
              <p className="text-sm text-muted-foreground">Used for high-resolution property photos and document storage.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-primary bg-primary text-primary-foreground ring-primary">
        <CardContent className="grid gap-6 py-2 md:grid-cols-[280px_1fr] md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.15em] text-primary-foreground/70">Loyalty status</p>
            <div className="mt-2 flex items-end gap-3">
              <p className="font-heading text-4xl font-semibold">{points.toLocaleString("en-NG")}</p>
              <div className="pb-1"><p className="font-semibold text-accent">Points</p><p className="text-sm text-primary-foreground/70">Gold Tier Vendor</p></div>
            </div>
            <p className="mt-4 text-sm"><span className="font-semibold text-accent">{Math.max(15_000 - points, 0).toLocaleString("en-NG")} more points</span> to unlock Platinum Tier.</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-sm"><span>Gold Tier (10,000)</span><span>Platinum Tier (15,000)</span></div>
            <div className="h-3 overflow-hidden rounded-full bg-primary-foreground/20"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min((points / 15_000) * 100, 100)}%` }} /></div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" size="lg" onClick={() => toast.info("Earn points through approved listings, verified reviews, and completed bookings.")}>How to earn points</Button>
              <Button variant="outline" size="lg" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={() => document.getElementById("points-history")?.scrollIntoView({ behavior: "smooth" })}>My rewards history</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between"><h2 className="font-heading text-2xl font-semibold">Redeemable Rewards</h2><Button variant="link" onClick={() => toast.info("All available preview rewards are shown below.")}>View all rewards</Button></div>
        <div className="grid gap-4 md:grid-cols-3">
          {rewards.map(({ title, points: cost, description, icon: Icon }) => (
            <Card key={title} className="h-full">
              <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-accent/30">
                <Icon className="size-20 text-primary/70" aria-hidden="true" />
                <Badge className="absolute bottom-3 left-3 bg-accent text-accent-foreground">{cost.toLocaleString("en-NG")} points</Badge>
              </div>
              <CardHeader><CardTitle>{title}</CardTitle><CardDescription className="leading-6">{description}</CardDescription></CardHeader>
              <CardFooter className="mt-auto border-0 bg-transparent pt-0"><Button className="w-full" onClick={() => onRedeem(cost, title)}>Redeem reward</Button></CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[1.7fr_0.9fr]">
        <Card id="points-history">
          <CardHeader><CardTitle>Point Earning Activity</CardTitle></CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader><TableRow><TableHead className="pl-4">Activity</TableHead><TableHead>Status</TableHead><TableHead>Points</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {[
                  ["Property Approved", "Credited", "+500", "June 25, 2026"],
                  ["5-Star Guest Review", "Credited", "+200", "June 22, 2026"],
                  ["Featured Boost Redeemed", "Debited", "-5,000", "June 18, 2026"],
                  ["Vendor Identity Verified", "Credited", "+1,000", "June 12, 2026"],
                ].map(([activity, status, amount, date]) => (
                  <TableRow key={activity}><TableCell className="pl-4 font-medium">{activity}</TableCell><TableCell><Badge variant={status === "Debited" ? "destructive" : "secondary"}>{status}</Badge></TableCell><TableCell className={amount.startsWith("-") ? "text-destructive" : "text-primary"}>{amount}</TableCell><TableCell>{date}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Subscription Settings</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4"><div><p className="font-medium">Auto-renewal</p><p className="text-sm text-muted-foreground">Renews on the 12th of every month</p></div><Checkbox checked={autoRenew} onCheckedChange={(checked) => onAutoRenew(checked === true)} aria-label="Toggle automatic renewal" /></div>
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3"><CreditCard className="size-8 text-primary" /><div className="flex-1"><p className="font-medium">Visa ending in 4521</p><p className="text-sm text-muted-foreground">Expires 08/28</p></div></div>
              <Button variant="outline" onClick={onCheckout}>Update payment method</Button>
            </CardContent>
          </Card>
          <Card id="payment-history">
            <CardHeader><CardTitle>Recent invoices</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              {["INV-2026-00125", "INV-2026-00098"].map((invoice, index) => <div key={invoice} className="flex items-start justify-between gap-3"><div><p className="font-medium">{invoice}</p><p className="text-sm text-muted-foreground">{index ? "May 12, 2026" : "June 12, 2026"}</p></div><div className="text-right"><p className="font-medium">{currency.format(50_000)}</p><Badge variant="secondary">Paid</Badge></div></div>)}
            </CardContent>
            <CardFooter><Button variant="ghost" className="w-full" onClick={() => toast.info("Invoice downloads will be enabled with the subscription API.")}><Download data-icon="inline-start" /> Download all invoices</Button></CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}

function PlansView({ onChoose, onBack }: { onChoose: (id: PlanId) => void; onBack: () => void }) {
  return (
    <>
      <PageHeading title="Choose the Right Plan for Your Growth" description="Scale your property business with tools designed for high-performance hospitality. Change plans anytime." actions={<Button variant="outline" onClick={onBack}>Back to plan</Button>} />
      <div className="grid items-stretch gap-4 pt-16 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={cn("relative min-h-[540px]", plan.recommended && "ring-2 ring-primary")}>
            {plan.recommended && <Badge className="absolute -top-4 left-1/2 h-7 -translate-x-1/2 px-6 uppercase tracking-widest">Recommended</Badge>}
            <CardHeader className="pt-4"><Badge variant="secondary" className="uppercase tracking-wide">{plan.eyebrow}</Badge><CardDescription className="pt-3 text-foreground">{plan.name}</CardDescription><CardTitle className="pt-2 text-3xl">{plan.price ? <>{currency.format(plan.price)} <span className="text-sm font-normal text-muted-foreground">/mo</span></> : "Custom"}</CardTitle></CardHeader>
            <CardContent className="flex flex-1 flex-col gap-5 pt-4">
              {plan.features.map((feature) => <div key={feature} className="flex gap-3"><BadgeCheck className="mt-0.5 size-5 shrink-0 text-primary" /><span className={cn(plan.recommended && "font-medium")}>{feature}</span></div>)}
              {plan.unavailable.map((feature) => <div key={feature} className="flex gap-3 text-muted-foreground/60"><X className="mt-0.5 size-5 shrink-0" /><span>{feature}</span></div>)}
            </CardContent>
            <CardFooter className="border-0 bg-transparent"><Button variant={plan.recommended ? "default" : "outline"} size="lg" className="w-full" onClick={() => onChoose(plan.id)}>{plan.id === "starter" ? "Choose Starter" : plan.id === "professional" ? "Upgrade Now" : "Contact Sales"}</Button></CardFooter>
          </Card>
        ))}
      </div>
      <div className="flex flex-col gap-3 pt-12 text-center"><h2 className="font-heading text-3xl font-semibold">Frequently Asked Questions</h2><p className="text-muted-foreground">Have questions about billing or plans? Our support team is always here to help.</p></div>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        {faqs.map((faq, index) => <FaqCard key={faq.question} {...faq} defaultOpen={index === 0} />)}
      </div>
    </>
  );
}

function FaqCard({ question, answer, defaultOpen }: { question: string; answer: string; defaultOpen?: boolean }) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="rounded-xl ring-1 ring-foreground/10">
      <CollapsibleTrigger className="flex w-full items-center gap-4 px-6 py-5 text-left font-semibold [&[data-state=open]>svg]:rotate-180"><ChevronDown className="size-5 text-primary transition-transform" /><span>{question}</span></CollapsibleTrigger>
      <CollapsibleContent className="px-6 pb-6 pl-15 text-sm leading-6 text-muted-foreground">{answer}</CollapsibleContent>
    </Collapsible>
  );
}

function CheckoutView({ fullName, email, plan, paymentMethod, onPaymentMethod, confirmedBilling, acceptedTerms, onConfirmedBilling, onAcceptedTerms, onPay, onBack }: { fullName: string; email: string; plan: (typeof plans)[number]; paymentMethod: string; onPaymentMethod: (value: string) => void; confirmedBilling: boolean; acceptedTerms: boolean; onConfirmedBilling: (value: boolean) => void; onAcceptedTerms: (value: boolean) => void; onPay: () => void; onBack: () => void }) {
  const price = plan.price ?? 0;
  const paymentOptions = [{ id: "card", label: "Credit/Debit Card", description: "Saved card ending in **** 4521", icon: CreditCard }, { id: "paystack", label: "Paystack", description: "Secure web payment via Paystack", icon: WalletCards }, { id: "bank", label: "Bank Transfer", description: "Manual transfer to PropertyArk corporate account", icon: Banknote }, { id: "flutterwave", label: "Flutterwave", description: "Mobile money and international payments", icon: ReceiptText }];
  return (
    <>
      <PageHeading title="Complete Your Subscription" description="Scale your shortlet management with professional vendor tools." actions={<Button variant="outline" onClick={onBack}>Back to plans</Button>} />
      <div className="grid items-start gap-6 lg:grid-cols-[1.7fr_0.9fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><Badge className="size-8 rounded-full bg-accent text-accent-foreground">1</Badge> Billing Information</CardTitle></CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-2"><Field><FieldLabel htmlFor="billing-name">Full Name</FieldLabel><Input id="billing-name" defaultValue={fullName} /></Field><Field><FieldLabel htmlFor="business-name">Business Name</FieldLabel><Input id="business-name" placeholder="Your registered business" /></Field></div>
                <Field><FieldLabel htmlFor="billing-email">Email Address</FieldLabel><Input id="billing-email" type="email" defaultValue={email} /></Field>
                <Field><FieldLabel htmlFor="billing-address">Billing Address</FieldLabel><Input id="billing-address" placeholder="Enter your complete billing address" /></Field>
              </FieldGroup>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><Badge className="size-8 rounded-full bg-accent text-accent-foreground">2</Badge> Payment Method</CardTitle></CardHeader>
            <CardContent>
              <ToggleGroup type="single" value={paymentMethod} onValueChange={(value) => value && onPaymentMethod(value)} className="h-auto w-full flex-col bg-transparent p-0">
                {paymentOptions.map(({ id, label, description, icon: Icon }) => <ToggleGroupItem key={id} value={id} className="h-auto w-full justify-start rounded-lg border p-4 text-left data-[state=on]:border-primary data-[state=on]:bg-primary/5"><Icon className="size-6 text-primary" /><span className="flex flex-1 flex-col items-start"><span className="font-semibold text-foreground">{label}</span><span className="text-sm font-normal text-muted-foreground">{description}</span></span><span className="size-5 rounded-full border data-[state=on]:border-primary" /></ToggleGroupItem>)}
              </ToggleGroup>
            </CardContent>
          </Card>
          <FieldSet className="px-2"><FieldLegend className="sr-only">Checkout confirmations</FieldLegend><Field orientation="horizontal"><Checkbox id="billing-confirm" checked={confirmedBilling} onCheckedChange={(checked) => onConfirmedBilling(checked === true)} /><FieldLabel htmlFor="billing-confirm">I confirm my billing information is accurate and matches my identification.</FieldLabel></Field><Field orientation="horizontal"><Checkbox id="terms-confirm" checked={acceptedTerms} onCheckedChange={(checked) => onAcceptedTerms(checked === true)} /><FieldLabel htmlFor="terms-confirm">I agree to PropertyArk subscription terms and privacy policy regarding automatic renewals.</FieldLabel></Field></FieldSet>
        </div>
        <div className="flex flex-col gap-5 lg:sticky lg:top-24">
          <Card className="bg-primary text-primary-foreground ring-primary">
            <CardHeader><CardDescription className="text-primary-foreground/80">{plan.name} Vendor</CardDescription><CardAction className="text-right"><p className="font-heading text-2xl font-semibold">{currency.format(price)}</p><p className="text-xs text-primary-foreground/70">per month</p></CardAction></CardHeader>
            <CardContent className="flex flex-col gap-3">{plan.features.slice(0, 4).map((feature) => <div key={feature} className="flex gap-2"><Check className="size-4 text-accent" /><span>{feature}</span></div>)}</CardContent>
            <CardFooter className="border-primary-foreground/15 bg-primary-foreground/5"><div className="flex w-full justify-between"><span className="uppercase tracking-wide text-primary-foreground/70">Next billing</span><span className="font-semibold">Aug 31, 2026</span></div></CardFooter>
          </Card>
          <Card>
            <CardHeader><CardTitle className="uppercase tracking-wider text-muted-foreground">Payment summary</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4"><div className="flex justify-between"><span>Subscription fee</span><span className="font-medium">{currency.format(price)}</span></div><div className="flex justify-between"><span>VAT (0%)</span><span className="font-medium">{currency.format(0)}</span></div><Separator /><div className="flex justify-between text-lg"><span>Total</span><span className="font-heading font-semibold text-primary">{currency.format(price)}</span></div><Button size="lg" onClick={onPay}>Pay {currency.format(price)}</Button><div className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="size-4 text-primary" /> PCI-DSS compliant infrastructure</div><FieldDescription className="text-center">Preview checkout only. No charge will be made until the subscription API is connected.</FieldDescription></CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
