import Image from "next/image";
import { Download, MapPin, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FinanceStatusBadge } from "./finance-status-badge";
import type { FinanceTransaction } from "./types";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const dateTime = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function TransactionDetails({
  transaction,
  compact = false,
}: {
  transaction: FinanceTransaction;
  compact?: boolean;
}) {
  return (
    <Card
      className={
        compact ? "border-0 shadow-none ring-0" : "lg:sticky lg:top-24"
      }
    >
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-xl">Transaction Details</CardTitle>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-semibold text-muted-foreground">
              {transaction.id}
            </p>
            <p className="mt-1 text-2xl font-semibold text-primary">
              {currency.format(transaction.amount)}
            </p>
          </div>
          <FinanceStatusBadge status={transaction.status} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Property information
          </p>
          <div className="flex items-center gap-3">
            <Image
              src={transaction.property.imageUrl}
              alt={transaction.property.name}
              width={84}
              height={84}
              className="size-20 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-semibold">
                {transaction.property.name}
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-4" aria-hidden="true" />
                {transaction.property.location}
              </p>
              <Button
                variant="link"
                className="mt-1 h-auto p-0"
                onClick={() =>
                  toast.info(
                    "Property links will use live listing IDs when the finance API is connected.",
                  )
                }
              >
                View Property
              </Button>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            User information
          </p>
          <dl className="flex flex-col gap-2 rounded-xl bg-muted/60 p-4 text-sm">
            <DetailLine label="Name" value={transaction.user.name} />
            <DetailLine label="Email" value={transaction.user.email} />
            <DetailLine label="Phone" value={transaction.user.phone} />
          </dl>
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Timeline
          </p>
          <ol className="flex flex-col gap-0">
            {transaction.timeline.map((item, index) => (
              <li
                key={`${item.title}-${item.date}`}
                className="grid grid-cols-[16px_1fr] gap-3"
              >
                <div className="flex flex-col items-center">
                  <span className="mt-1 size-2 rounded-full bg-primary" />
                  {index < transaction.timeline.length - 1 && (
                    <span className="min-h-10 w-px flex-1 bg-primary/25" />
                  )}
                </div>
                <div className="pb-5">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {dateTime.format(new Date(item.date))}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 bg-card pt-4">
        <Button variant="outline" asChild>
          <a href={`mailto:${transaction.user.email}`}>
            <MessageSquareText data-icon="inline-start" />
            Contact User
          </a>
        </Button>
        <Button
          onClick={() =>
            toast.info(
              "Receipt downloads will be enabled with the finance API.",
            )
          }
        >
          <Download data-icon="inline-start" />
          Download Receipt
        </Button>
      </CardFooter>
    </Card>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-all text-right font-medium">{value}</dd>
    </div>
  );
}
