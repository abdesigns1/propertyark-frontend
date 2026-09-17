"use client";

import { useState, type FormEvent } from "react";
import { Coins, Gift, LoaderCircle, Save, ShieldCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import {
  useAdminCreditSettings,
  useUpdateAdminCreditSettings,
} from "@/features/admin/hooks/use-admin-credit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DEFAULT_CREDIT_SETTINGS,
  type CreditPointSettings,
} from "@/services/admin-credit.service";
import { getApiErrorMessage } from "@/services/api-error";

const fields: Array<{
  key: Exclude<keyof CreditPointSettings, "currency">;
  label: string;
  help: string;
}> = [
  { key: "newVendorBonusPoints", label: "New vendor bonus", help: "Points granted after vendor onboarding." },
  { key: "newVendorBonusExpiryDays", label: "Bonus validity", help: "Days before onboarding bonus points expire." },
  { key: "propertyCreationCost", label: "Property listing cost", help: "Points charged when a property is listed." },
  { key: "featurePropertyCost", label: "Featured property cost", help: "Points charged for featured placement." },
  { key: "featurePropertyDurationDays", label: "Featured duration", help: "Number of days a featured placement remains active." },
  { key: "minimumPurchasePoints", label: "Minimum purchase", help: "Fewest points a vendor can purchase." },
  { key: "pricePerPoint", label: "Price per point", help: "Amount charged for one point in the selected currency." },
];

function SettingsForm({ initial }: { initial: CreditPointSettings }) {
  const [settings, setSettings] = useState(initial);
  const update = useUpdateAdminCreditSettings();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fields.some(({ key }) => !Number.isFinite(settings[key]) || settings[key] < 0)) {
      toast.error("Enter valid non-negative values for every point setting.");
      return;
    }
    update.mutate(settings, {
      onSuccess: () => toast.success("Credit point settings updated."),
      onError: (error) => toast.error(getApiErrorMessage(error, "Credit settings could not be updated.")),
    });
  }

  return (
    <form onSubmit={submit}>
      <Card>
        <CardHeader>
          <CardTitle>Point rules and pricing</CardTitle>
          <CardDescription>Changes affect future vendor charges and purchases. Existing ledger entries remain unchanged.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FieldGroup className="grid gap-5 md:grid-cols-2">
            {fields.map((field) => (
              <Field key={field.key}>
                <FieldLabel htmlFor={field.key}>{field.label}</FieldLabel>
                <Input
                  id={field.key}
                  type="number"
                  min={0}
                  step={1}
                  value={settings[field.key]}
                  onChange={(event) => setSettings((current) => ({ ...current, [field.key]: Number(event.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">{field.help}</p>
              </Field>
            ))}
            <Field>
              <FieldLabel htmlFor="credit-currency">Currency</FieldLabel>
              <Input
                id="credit-currency"
                value={settings.currency}
                maxLength={3}
                onChange={(event) => setSettings((current) => ({ ...current, currency: event.target.value.toUpperCase() }))}
              />
              <p className="text-xs text-muted-foreground">Paystack settlement and display currency.</p>
            </Field>
          </FieldGroup>
          <div className="flex justify-end border-t pt-5">
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? <LoaderCircle className="animate-spin" /> : <Save />}
              {update.isPending ? "Saving changes..." : "Save point settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export function AdminPointsManagementPage() {
  const query = useAdminCreditSettings();
  const settings = query.data ?? DEFAULT_CREDIT_SETTINGS;

  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
        <header>
          <Badge variant="secondary" className="mb-3"><ShieldCheck /> Admin controlled</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Points Management</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Control how vendors receive, purchase, and spend credit points across PropertyArk.</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardHeader><Coins className="size-5 text-primary" /><CardDescription>Point price</CardDescription><CardTitle>{query.isPending ? <Skeleton className="h-8 w-24" /> : `₦${settings.pricePerPoint.toLocaleString("en-NG")}`}</CardTitle></CardHeader></Card>
          <Card><CardHeader><Gift className="size-5 text-secondary" /><CardDescription>New vendor bonus</CardDescription><CardTitle>{query.isPending ? <Skeleton className="h-8 w-24" /> : `${settings.newVendorBonusPoints.toLocaleString("en-NG")} points`}</CardTitle></CardHeader></Card>
          <Card><CardHeader><Star className="size-5 text-primary" /><CardDescription>Featured placement</CardDescription><CardTitle>{query.isPending ? <Skeleton className="h-8 w-24" /> : `${settings.featurePropertyCost.toLocaleString("en-NG")} points`}</CardTitle></CardHeader></Card>
        </div>

        {query.isError && (
          <Card className="border-secondary/30 bg-secondary/5">
            <CardHeader>
              <CardTitle className="text-base">Current settings could not be loaded</CardTitle>
              <CardDescription>The documented defaults are shown below. Verify them before saving; the update endpoint remains available.</CardDescription>
            </CardHeader>
          </Card>
        )}
        <SettingsForm key={query.data ? JSON.stringify(query.data) : "defaults"} initial={settings} />
      </main>
    </AdminWorkspace>
  );
}
