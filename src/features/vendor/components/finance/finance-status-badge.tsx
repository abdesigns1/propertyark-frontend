import { Badge } from "@/components/ui/badge";
import type { FinanceTransactionStatus } from "./types";

const STATUS_LABELS: Record<FinanceTransactionStatus, string> = {
  COMPLETED: "Completed",
  PENDING: "Pending",
  ESCROW_HELD: "Escrow Held",
  PROCESSING: "Processing",
};

export function FinanceStatusBadge({
  status,
}: {
  status: FinanceTransactionStatus;
}) {
  const variant =
    status === "COMPLETED"
      ? "default"
      : status === "PENDING"
        ? "secondary"
        : "outline";

  return <Badge variant={variant}>{STATUS_LABELS[status]}</Badge>;
}
