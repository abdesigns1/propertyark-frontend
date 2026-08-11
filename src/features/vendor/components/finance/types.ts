export type FinanceTransactionStatus =
  "COMPLETED" | "PENDING" | "ESCROW_HELD" | "PROCESSING";

export interface FinanceTransactionTimelineItem {
  title: string;
  date: string;
}

export interface FinanceTransaction {
  id: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  property: {
    id: string;
    name: string;
    type: string;
    location: string;
    imageUrl: string;
  };
  amount: number;
  status: FinanceTransactionStatus;
  date: string;
  timeline: FinanceTransactionTimelineItem[];
}

export interface FinanceMetric {
  label: string;
  value: string;
  trend?: string;
  tone?: "positive" | "attention" | "neutral";
}
