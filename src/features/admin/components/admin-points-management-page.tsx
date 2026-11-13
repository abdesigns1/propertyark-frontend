"use client";

import { useState, type FormEvent } from "react";
import {
  Building2,
  CalendarClock,
  Check,
  ChevronsUpDown,
  Coins,
  Gift,
  History,
  LoaderCircle,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { AdminStatCard } from "@/features/admin/components/admin-stat-card";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
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
  const [vendorPickerOpen, setVendorPickerOpen] = useState(false);
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
  const selectedVendor = (vendors.data ?? []).find(
    (vendor) => vendor.id === selectedVendorIds[0],
  );
  const recipientCount =
    mode === "all"
      ? (vendors.data?.length ?? 0)
      : mode === "individual"
        ? Math.min(selectedVendorIds.length, 1)
        : selectedVendorIds.length;
  const pointValue = Number(points);
  const totalGiftPoints =
    Number.isInteger(pointValue) && pointValue > 0
      ? pointValue * recipientCount
      : 0;

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
        <Card className="overflow-hidden border-primary/15 shadow-sm">
          <CardHeader className="border-b bg-linear-to-r from-primary/10 via-primary/5 to-card">
            <Badge variant="secondary" className="mb-1 w-fit">
              <Gift aria-hidden="true" /> Issue credit gift
            </Badge>
            <CardTitle className="text-xl">Gift vendor credit points</CardTitle>
            <CardDescription>
              Reward one vendor, a selected group, or every vendor on the
              platform. Each gift is recorded with its name, reason, and expiry.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ol
              className="grid gap-2 sm:grid-cols-3"
              aria-label="Gift workflow"
            >
              {[
                ["1", "Choose recipients"],
                ["2", "Set gift details"],
                ["3", "Review and issue"],
              ].map(([step, label]) => (
                <li
                  key={step}
                  className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
                >
                  <Badge>{step}</Badge>
                  <span className="text-sm font-medium">{label}</span>
                </li>
              ))}
            </ol>
            <FieldGroup>
              <FieldSet className="rounded-xl border bg-background p-4 sm:p-5">
                <FieldLegend>1. Choose recipients</FieldLegend>
                <FieldDescription>
                  Select whether this reward goes to one vendor, a selected
                  group, or the entire vendor network.
                </FieldDescription>
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
                  <Popover
                    open={vendorPickerOpen}
                    onOpenChange={setVendorPickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        id="credit-gift-vendor"
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={vendorPickerOpen}
                        aria-invalid={Boolean(errors.vendors)}
                        disabled={vendors.isPending || vendors.isError}
                        className="w-full justify-between font-normal"
                      >
                        <span className="min-w-0 truncate">
                          {vendors.isPending
                            ? "Loading vendors…"
                            : selectedVendor
                              ? `${selectedVendor.fullName} · ${selectedVendor.email}`
                              : "Search and select a vendor"}
                        </span>
                        <ChevronsUpDown
                          data-icon="inline-end"
                          className="opacity-50"
                          aria-hidden="true"
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="w-(--radix-popover-trigger-width) p-0"
                    >
                      <Command>
                        <CommandInput placeholder="Search vendors by name or email…" />
                        <CommandList>
                          <CommandEmpty>No vendor found.</CommandEmpty>
                          <CommandGroup heading="Vendors">
                            {(vendors.data ?? []).map((vendor) => (
                              <CommandItem
                                key={vendor.id}
                                value={`${vendor.fullName} ${vendor.email} ${vendor.id}`}
                                onSelect={() => {
                                  setSelectedVendorIds([vendor.id]);
                                  setVendorPickerOpen(false);
                                  setErrors((current) => ({
                                    ...current,
                                    vendors: undefined,
                                  }));
                                }}
                              >
                                <Check
                                  className={cn(
                                    "size-4",
                                    selectedVendor?.id === vendor.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                  aria-hidden="true"
                                />
                                <span className="min-w-0">
                                  <span className="block truncate font-medium">
                                    {vendor.fullName}
                                  </span>
                                  <span className="block truncate text-xs text-muted-foreground">
                                    {vendor.email}
                                  </span>
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FieldDescription>
                    Type a vendor name or email to narrow the list.
                  </FieldDescription>
                  <FieldError>{errors.vendors}</FieldError>
                </Field>
              )}

              {mode === "multiple" && (
                <FieldSet
                  data-invalid={Boolean(errors.vendors)}
                  className="rounded-xl border bg-muted/20 p-4"
                >
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

              <FieldSet className="rounded-xl border bg-background p-4 sm:p-5">
                <FieldLegend>2. Set gift details</FieldLegend>
                <FieldDescription>
                  Define the amount each vendor receives and provide a clear
                  audit description and expiry.
                </FieldDescription>
                <FieldGroup className="grid gap-5 md:grid-cols-2">
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
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium">3. Review and issue</p>
              <p className="text-xs text-muted-foreground">
                {recipientCount > 0 && totalGiftPoints > 0
                  ? `${pointValue.toLocaleString("en-NG")} points × ${recipientCount.toLocaleString("en-NG")} vendor${recipientCount === 1 ? "" : "s"} = ${totalGiftPoints.toLocaleString("en-NG")} total points`
                  : "Choose recipients and enter an amount to preview the total gift."}
              </p>
            </div>
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
            <Badge variant="outline" className="mb-2">
              <History aria-hidden="true" /> Audit trail
            </Badge>
            <CardTitle className="text-xl">Credit gift history</CardTitle>
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
      <Card className="overflow-hidden border-primary/15 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <Badge variant="outline" className="mb-1 w-fit">
            <Settings2 aria-hidden="true" /> Configuration
          </Badge>
          <CardTitle className="text-xl">Point rules and pricing</CardTitle>
          <CardDescription>
            Changes affect future vendor charges and purchases. Existing ledger
            entries remain unchanged.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Alert>
            <ShieldCheck />
            <AlertTitle>Future activity only</AlertTitle>
            <AlertDescription>
              Saving new values changes future purchases, bonuses, listings, and
              featured placements. Historical wallet entries are preserved.
            </AlertDescription>
          </Alert>
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
                <FieldDescription>{field.help}</FieldDescription>
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
              <FieldDescription>
                Paystack settlement and display currency.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            {update.isPending ? "Saving changes..." : "Save point settings"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export function AdminPointsManagementPage() {
  const query = useAdminCreditSettings();
  const settings = query.data ?? DEFAULT_CREDIT_SETTINGS;

  return (
    <AdminWorkspace>
      <main className="mx-auto flex max-w-[1500px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <Card className="relative gap-0 overflow-hidden border-primary/15 bg-linear-to-br from-card via-card to-primary/10 py-0 shadow-sm ring-primary/10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-primary/10 blur-3xl"
          />
          <CardHeader className="relative gap-3 p-5 pb-3 sm:p-6 sm:pb-4 lg:p-8 lg:pb-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                <ShieldCheck aria-hidden="true" /> Admin controlled
              </Badge>
              <Badge variant="outline">
                <Sparkles aria-hidden="true" /> Live credit configuration
              </Badge>
            </div>
            <CardTitle>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Points Management
              </h1>
            </CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-6 sm:text-base">
              A central control room for vendor credits. Set the value of each
              point, define how vendors earn and spend them, issue rewards, and
              review every administrative gift.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative flex flex-wrap gap-2 p-5 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0">
            <Badge variant="outline">Purchase rules</Badge>
            <Badge variant="outline">Bonus and gifting</Badge>
            <Badge variant="outline">Listing costs</Badge>
            <Badge variant="outline">Featured placement</Badge>
            <Badge variant="outline">Audit history</Badge>
          </CardContent>
        </Card>

        <section aria-labelledby="current-point-rules-heading">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="current-point-rules-heading"
                className="text-xl font-semibold tracking-tight"
              >
                Current point rules
              </h2>
              <p className="text-sm text-muted-foreground">
                The live values currently applied to vendor activity.
              </p>
            </div>
            <Badge variant="success">System active</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              icon={Coins}
              label="Point purchase price"
              value={`₦${settings.pricePerPoint.toLocaleString("en-NG")}`}
              note={`Vendors must purchase at least ${settings.minimumPurchasePoints.toLocaleString("en-NG")} points per transaction.`}
              action={<Badge variant="outline">Live rule</Badge>}
              tone="primary"
              loading={query.isPending}
            />
            <AdminStatCard
              icon={Gift}
              label="New vendor bonus"
              value={`${settings.newVendorBonusPoints.toLocaleString("en-NG")} points`}
              note={`Onboarding reward, valid for ${settings.newVendorBonusExpiryDays.toLocaleString("en-NG")} days.`}
              action={<Badge variant="outline">Live rule</Badge>}
              tone="secondary"
              loading={query.isPending}
            />
            <AdminStatCard
              icon={Building2}
              label="Property listing cost"
              value={`${settings.propertyCreationCost.toLocaleString("en-NG")} points`}
              note="Deducted when a vendor publishes a new property listing."
              action={<Badge variant="outline">Live rule</Badge>}
              tone="primary"
              loading={query.isPending}
            />
            <AdminStatCard
              icon={Star}
              label="Featured placement"
              value={`${settings.featurePropertyCost.toLocaleString("en-NG")} points`}
              note={`Keeps a property featured for ${settings.featurePropertyDurationDays.toLocaleString("en-NG")} days.`}
              action={<Badge variant="outline">Live rule</Badge>}
              tone="warning"
              loading={query.isPending}
            />
          </div>
        </section>

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
