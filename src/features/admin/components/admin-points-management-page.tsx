"use client";

import { useState, type FormEvent } from "react";
import {
  CalendarClock,
  Coins,
  Gift,
  LoaderCircle,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Star,
  UserRound,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import {
  useAdminCreditGiftHistory,
  useAdminCreditSettings,
  useAdminCreditVendors,
  useGiftAdminCreditPoints,
  useUpdateAdminCreditSettings,
} from "@/features/admin/hooks/use-admin-credit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  type AdminCreditGiftInput,
  DEFAULT_CREDIT_SETTINGS,
  type CreditPointSettings,
} from "@/services/admin-credit.service";
import { getApiErrorMessage } from "@/services/api-error";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const fields: Array<{
  key: Exclude<keyof CreditPointSettings, "currency">;
  label: string;
  help: string;
}> = [
  {
    key: "newVendorBonusPoints",
    label: "New vendor bonus",
    help: "Points granted after vendor onboarding.",
  },
  {
    key: "newVendorBonusExpiryDays",
    label: "Bonus validity",
    help: "Days before onboarding bonus points expire.",
  },
  {
    key: "propertyCreationCost",
    label: "Property listing cost",
    help: "Points charged when a property is listed.",
  },
  {
    key: "featurePropertyCost",
    label: "Featured property cost",
    help: "Points charged for featured placement.",
  },
  {
    key: "featurePropertyDurationDays",
    label: "Featured duration",
    help: "Number of days a featured placement remains active.",
  },
  {
    key: "minimumPurchasePoints",
    label: "Minimum purchase",
    help: "Fewest points a vendor can purchase.",
  },
  {
    key: "pricePerPoint",
    label: "Price per point",
    help: "Amount charged for one point in the selected currency.",
  },
];

type RecipientMode = "individual" | "multiple" | "all";

function futureDateTimeLocal(days = 30) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setSeconds(0, 0);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface GiftErrors {
  vendors?: string;
  points?: string;
  name?: string;
  expiresAt?: string;
  reason?: string;
}

function CreditGiftForm() {
  const vendors = useAdminCreditVendors();
  const gift = useGiftAdminCreditPoints();
  const [mode, setMode] = useState<RecipientMode>("individual");
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [points, setPoints] = useState("");
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState(() => futureDateTimeLocal());
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<GiftErrors>({});
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);
  const [pendingGift, setPendingGift] = useState<AdminCreditGiftInput | null>(
    null,
  );

  const visibleVendors = (vendors.data ?? []).filter((vendor) => {
    const query = search.trim().toLocaleLowerCase();
    return (
      !query ||
      vendor.fullName.toLocaleLowerCase().includes(query) ||
      vendor.email.toLocaleLowerCase().includes(query)
    );
  });

  function toggleVendor(vendorId: string, checked: boolean) {
    setSelectedVendorIds((current) =>
      checked
        ? [...new Set([...current, vendorId])]
        : current.filter((id) => id !== vendorId),
    );
  }

  function validateGift() {
    const nextErrors: GiftErrors = {};
    const pointValue = Number(points);
    const selectedIds =
      mode === "individual" ? selectedVendorIds.slice(0, 1) : selectedVendorIds;

    if (mode !== "all" && selectedIds.length === 0) {
      nextErrors.vendors =
        mode === "individual"
          ? "Select a vendor to receive this gift."
          : "Select at least one vendor to receive this gift.";
    }
    if (!Number.isInteger(pointValue) || pointValue <= 0) {
      nextErrors.points = "Enter a whole number greater than zero.";
    }
    if (!name.trim()) nextErrors.name = "Enter a name for this credit gift.";
    const expiry = new Date(expiresAt);
    if (!expiresAt || Number.isNaN(expiry.getTime())) {
      nextErrors.expiresAt = "Choose a valid expiry date and time.";
    } else if (expiry.getTime() <= Date.now()) {
      nextErrors.expiresAt = "The expiry must be in the future.";
    }
    if (!reason.trim()) {
      nextErrors.reason = "Explain why these points are being gifted.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return null;

    return {
      ...(mode === "all" ? {} : { vendorIds: selectedIds }),
      points: pointValue,
      name: name.trim(),
      expiresAt: expiry.toISOString(),
      reason: reason.trim(),
    } satisfies AdminCreditGiftInput;
  }

  function resetForm() {
    setSelectedVendorIds([]);
    setPoints("");
    setName("");
    setExpiresAt(futureDateTimeLocal());
    setReason("");
    setErrors({});
    setPendingGift(null);
  }

  function sendGift(payload: AdminCreditGiftInput) {
    gift.mutate(payload, {
      onSuccess: () => {
        const recipient =
          mode === "all"
            ? "every vendor"
            : `${payload.vendorIds?.length ?? 0} vendor${payload.vendorIds?.length === 1 ? "" : "s"}`;
        toast.success(
          `${payload.points.toLocaleString("en-NG")} points gifted to ${recipient}.`,
        );
        setConfirmAllOpen(false);
        resetForm();
      },
      onError: (error) =>
        toast.error(
          getApiErrorMessage(error, "The credit gift could not be sent."),
        ),
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = validateGift();
    if (!payload) return;
    if (mode === "all") {
      setPendingGift(payload);
      setConfirmAllOpen(true);
      return;
    }
    sendGift(payload);
  }

  return (
    <>
      <form onSubmit={submit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="text-primary" /> Gift vendor credit points
            </CardTitle>
            <CardDescription>
              Reward one vendor, a selected group, or every vendor on the
              platform. Each gift is recorded with its name, reason, and expiry.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Recipients</FieldLegend>
                <ToggleGroup
                  type="single"
                  value={mode}
                  onValueChange={(value) => {
                    if (value) {
                      setMode(value as RecipientMode);
                      setErrors((current) => ({
                        ...current,
                        vendors: undefined,
                      }));
                    }
                  }}
                  className="grid h-auto w-full grid-cols-1 sm:grid-cols-3"
                >
                  <ToggleGroupItem value="individual" className="h-10">
                    <UserRound /> One vendor
                  </ToggleGroupItem>
                  <ToggleGroupItem value="multiple" className="h-10">
                    <UsersRound /> Multiple vendors
                  </ToggleGroupItem>
                  <ToggleGroupItem value="all" className="h-10">
                    <Gift /> All vendors
                  </ToggleGroupItem>
                </ToggleGroup>
              </FieldSet>

              {mode === "individual" && (
                <Field data-invalid={Boolean(errors.vendors)}>
                  <FieldLabel htmlFor="credit-gift-vendor">Vendor</FieldLabel>
                  <Select
                    value={selectedVendorIds[0] ?? ""}
                    onValueChange={(value) => {
                      setSelectedVendorIds([value]);
                      setErrors((current) => ({
                        ...current,
                        vendors: undefined,
                      }));
                    }}
                    disabled={vendors.isPending || vendors.isError}
                  >
                    <SelectTrigger
                      id="credit-gift-vendor"
                      className="w-full"
                      aria-invalid={Boolean(errors.vendors)}
                    >
                      <SelectValue
                        placeholder={
                          vendors.isPending
                            ? "Loading vendors…"
                            : "Select a vendor"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {(vendors.data ?? []).map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.fullName} · {vendor.email}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.vendors}</FieldError>
                </Field>
              )}

              {mode === "multiple" && (
                <FieldSet data-invalid={Boolean(errors.vendors)}>
                  <FieldLegend variant="label">Choose vendors</FieldLegend>
                  <FieldDescription>
                    {selectedVendorIds.length.toLocaleString("en-NG")} selected
                  </FieldDescription>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search vendors by name or email"
                      className="pl-9"
                    />
                  </div>
                  <FieldGroup
                    data-slot="checkbox-group"
                    className="max-h-72 overflow-y-auto rounded-lg border p-2"
                  >
                    {vendors.isPending ? (
                      <div className="flex flex-col gap-2">
                        {[1, 2, 3].map((item) => (
                          <Skeleton key={item} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : visibleVendors.length ? (
                      visibleVendors.map((vendor) => (
                        <FieldLabel
                          key={vendor.id}
                          htmlFor={`gift-${vendor.id}`}
                        >
                          <Field orientation="horizontal">
                            <Checkbox
                              id={`gift-${vendor.id}`}
                              checked={selectedVendorIds.includes(vendor.id)}
                              onCheckedChange={(checked) => {
                                toggleVendor(vendor.id, Boolean(checked));
                                setErrors((current) => ({
                                  ...current,
                                  vendors: undefined,
                                }));
                              }}
                            />
                            <FieldContent>
                              <FieldTitle>{vendor.fullName}</FieldTitle>
                              <FieldDescription>
                                {vendor.email}
                              </FieldDescription>
                            </FieldContent>
                          </Field>
                        </FieldLabel>
                      ))
                    ) : (
                      <p className="p-4 text-center text-sm text-muted-foreground">
                        No vendors match your search.
                      </p>
                    )}
                  </FieldGroup>
                  <FieldError>{errors.vendors}</FieldError>
                </FieldSet>
              )}

              {mode === "all" && (
                <Alert>
                  <UsersRound />
                  <AlertTitle>Every vendor will receive this gift</AlertTitle>
                  <AlertDescription>
                    The final confirmation will show the current vendor count.
                    Newly registered vendors will not receive this completed
                    gift automatically.
                  </AlertDescription>
                </Alert>
              )}

              {vendors.isError && mode !== "all" && (
                <Alert variant="destructive">
                  <AlertTitle>Vendors could not be loaded</AlertTitle>
                  <AlertDescription>
                    {getApiErrorMessage(
                      vendors.error,
                      "Refresh the vendor directory and try again.",
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <Field data-invalid={Boolean(errors.points)}>
                  <FieldLabel htmlFor="gift-points">
                    Points per vendor
                  </FieldLabel>
                  <Input
                    id="gift-points"
                    type="number"
                    min={1}
                    step={1}
                    value={points}
                    onChange={(event) => {
                      setPoints(event.target.value);
                      setErrors((current) => ({
                        ...current,
                        points: undefined,
                      }));
                    }}
                    placeholder="e.g. 25"
                    aria-invalid={Boolean(errors.points)}
                  />
                  <FieldError>{errors.points}</FieldError>
                </Field>
                <Field data-invalid={Boolean(errors.name)}>
                  <FieldLabel htmlFor="gift-name">Gift name</FieldLabel>
                  <Input
                    id="gift-name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setErrors((current) => ({
                        ...current,
                        name: undefined,
                      }));
                    }}
                    placeholder="e.g. Loyalty Bonus"
                    aria-invalid={Boolean(errors.name)}
                  />
                  <FieldError>{errors.name}</FieldError>
                </Field>
                <Field data-invalid={Boolean(errors.expiresAt)}>
                  <FieldLabel htmlFor="gift-expiry">Expires at</FieldLabel>
                  <Input
                    id="gift-expiry"
                    type="datetime-local"
                    min={futureDateTimeLocal(0)}
                    value={expiresAt}
                    onChange={(event) => {
                      setExpiresAt(event.target.value);
                      setErrors((current) => ({
                        ...current,
                        expiresAt: undefined,
                      }));
                    }}
                    aria-invalid={Boolean(errors.expiresAt)}
                  />
                  <FieldError>{errors.expiresAt}</FieldError>
                </Field>
                <Field data-invalid={Boolean(errors.reason)}>
                  <FieldLabel htmlFor="gift-reason">Reason</FieldLabel>
                  <Textarea
                    id="gift-reason"
                    value={reason}
                    onChange={(event) => {
                      setReason(event.target.value);
                      setErrors((current) => ({
                        ...current,
                        reason: undefined,
                      }));
                    }}
                    placeholder="Explain why this credit gift is being issued"
                    aria-invalid={Boolean(errors.reason)}
                  />
                  <FieldError>{errors.reason}</FieldError>
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={gift.isPending}>
              {gift.isPending ? (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                />
              ) : (
                <Gift data-icon="inline-start" />
              )}
              {gift.isPending ? "Sending gift…" : "Gift credit points"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Dialog
        open={confirmAllOpen}
        onOpenChange={(open) => {
          if (gift.isPending) return;
          setConfirmAllOpen(open);
          if (!open) setPendingGift(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gift points to every vendor?</DialogTitle>
            <DialogDescription>
              This will give {pendingGift?.points.toLocaleString("en-NG") ?? 0}{" "}
              points to all{" "}
              {vendors.data?.length.toLocaleString("en-NG") ?? "current"}{" "}
              vendors. This action creates credit ledger entries and should only
              be confirmed once.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={gift.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={() => pendingGift && sendGift(pendingGift)}
              disabled={!pendingGift || gift.isPending}
            >
              {gift.isPending && (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                />
              )}
              Confirm gift to all vendors
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatGiftDate(value: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function CreditGiftHistory() {
  const history = useAdminCreditGiftHistory();
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const gifts = (history.data ?? []).filter((gift) =>
    [gift.name, gift.reason, gift.recipientLabel, gift.giftedBy]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );

  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="border-b py-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Credit gift history</CardTitle>
            <CardDescription>
              Audit previously issued vendor gifts, recipients, expiry, and the
              administrator who sent them.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search gift history"
                className="pl-9"
                aria-label="Search credit gift history"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Refresh credit gift history"
              disabled={history.isFetching}
              onClick={() => history.refetch()}
            >
              <RefreshCw className={history.isFetching ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {history.isPending ? (
          <div className="flex flex-col gap-3 p-5">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-16 w-full" />
            ))}
          </div>
        ) : history.isError ? (
          <Empty className="min-h-64">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Gift />
              </EmptyMedia>
              <EmptyTitle>Gift history could not be loaded</EmptyTitle>
              <EmptyDescription>
                The admin activity ledger is unavailable. Refresh and try again.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : gifts.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Gift</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Gifted by</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead className="pr-5">Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gifts.map((gift) => (
                  <TableRow key={gift.id}>
                    <TableCell className="max-w-sm pl-5">
                      <p className="font-medium">{gift.name}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {gift.reason}
                      </p>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {gift.points === null
                        ? "Not recorded"
                        : gift.points.toLocaleString("en-NG")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{gift.recipientLabel}</Badge>
                    </TableCell>
                    <TableCell>{gift.giftedBy}</TableCell>
                    <TableCell>{formatGiftDate(gift.createdAt)}</TableCell>
                    <TableCell className="pr-5">
                      {formatGiftDate(gift.expiresAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Empty className="min-h-64">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarClock />
              </EmptyMedia>
              <EmptyTitle>
                {query ? "No matching credit gifts" : "No credit gifts yet"}
              </EmptyTitle>
              <EmptyDescription>
                {query
                  ? "Try a different gift name, reason, recipient, or administrator."
                  : "Admin credit gifts recorded by the backend will appear here."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
      {history.data && (
        <CardFooter className="border-t py-4 text-sm text-muted-foreground">
          {history.data.length.toLocaleString("en-NG")} gift record
          {history.data.length === 1 ? "" : "s"}
        </CardFooter>
      )}
    </Card>
  );
}

function SettingsForm({ initial }: { initial: CreditPointSettings }) {
  const [settings, setSettings] = useState(initial);
  const update = useUpdateAdminCreditSettings();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      fields.some(
        ({ key }) => !Number.isFinite(settings[key]) || settings[key] < 0,
      )
    ) {
      toast.error("Enter valid non-negative values for every point setting.");
      return;
    }
    update.mutate(settings, {
      onSuccess: () => toast.success("Credit point settings updated."),
      onError: (error) =>
        toast.error(
          getApiErrorMessage(error, "Credit settings could not be updated."),
        ),
    });
  }

  return (
    <form onSubmit={submit}>
      <Card>
        <CardHeader>
          <CardTitle>Point rules and pricing</CardTitle>
          <CardDescription>
            Changes affect future vendor charges and purchases. Existing ledger
            entries remain unchanged.
          </CardDescription>
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
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      [field.key]: Number(event.target.value),
                    }))
                  }
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
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    currency: event.target.value.toUpperCase(),
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Paystack settlement and display currency.
              </p>
            </Field>
          </FieldGroup>
          <div className="flex justify-end border-t pt-5">
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Save />
              )}
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
          <Badge variant="secondary" className="mb-3">
            <ShieldCheck /> Admin controlled
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Points Management
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Control how vendors receive, purchase, and spend credit points
            across PropertyArk.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <Coins className="size-5 text-primary" />
              <CardDescription>Point price</CardDescription>
              <CardTitle>
                {query.isPending ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  `₦${settings.pricePerPoint.toLocaleString("en-NG")}`
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Gift className="size-5 text-secondary" />
              <CardDescription>New vendor bonus</CardDescription>
              <CardTitle>
                {query.isPending ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  `${settings.newVendorBonusPoints.toLocaleString("en-NG")} points`
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Star className="size-5 text-primary" />
              <CardDescription>Featured placement</CardDescription>
              <CardTitle>
                {query.isPending ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  `${settings.featurePropertyCost.toLocaleString("en-NG")} points`
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {query.isError && (
          <Card className="border-secondary/30 bg-secondary/5">
            <CardHeader>
              <CardTitle className="text-base">
                Current settings could not be loaded
              </CardTitle>
              <CardDescription>
                The documented defaults are shown below. Verify them before
                saving; the update endpoint remains available.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        <CreditGiftForm />
        <CreditGiftHistory />
        <SettingsForm
          key={query.data ? JSON.stringify(query.data) : "defaults"}
          initial={settings}
        />
      </main>
    </AdminWorkspace>
  );
}
