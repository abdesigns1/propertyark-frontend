import { api } from "@/services/axios";

type ApiRecord = Record<string, unknown>;

export const PENDING_CREDIT_REFERENCE_KEY =
  "propertyark-pending-credit-reference";
export const PENDING_CREDIT_BALANCE_KEY =
  "propertyark-credit-balance-before-payment";

export interface CreditInfo {
  balance: number | null;
  currency: string;
  minimumPurchasePoints: number | null;
  pricePerPoint: number | null;
  transactions: CreditTransaction[];
}

export type CreditTransactionKind =
  "purchase" | "usage" | "refund" | "adjustment";
export type CreditTransactionStatus = "success" | "pending" | "failed";

export interface CreditTransaction {
  id: string;
  reference: string | null;
  description: string;
  kind: CreditTransactionKind;
  status: CreditTransactionStatus;
  points: number;
  amount: number | null;
  currency: string;
  createdAt: string | null;
}

export interface CreditPurchaseQuote {
  points: number;
  amount: number;
  currency: string;
}

export interface InitializedCreditPurchase extends CreditPurchaseQuote {
  authorizationUrl: string;
  reference: string | null;
}

export type PaymentVerificationState = "success" | "pending" | "failed";

export interface VerifiedCreditPurchase {
  state: PaymentVerificationState;
  message: string;
  reference: string;
  purchaseNumber: string | null;
  points: number | null;
  amountPaid: number | null;
  currency: string;
  newBalance: number | null;
  paidAt: string | null;
}

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordsIn(value: unknown): ApiRecord[] {
  const records: ApiRecord[] = [];
  const queue: unknown[] = [value];

  while (queue.length) {
    const current = queue.shift();
    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }
    if (!isRecord(current)) continue;
    records.push(current);
    queue.push(...Object.values(current));
  }

  return records;
}

function arrayFor(value: unknown, keys: readonly string[]) {
  for (const record of recordsIn(value)) {
    for (const key of keys) {
      if (Array.isArray(record[key])) return record[key];
    }
  }
  return [];
}

function valueFor(value: unknown, keys: readonly string[]) {
  for (const record of recordsIn(value)) {
    for (const key of keys) {
      if (record[key] !== undefined && record[key] !== null) {
        return record[key];
      }
    }
  }
  return undefined;
}

function stringFor(value: unknown, keys: readonly string[]) {
  const candidate = valueFor(value, keys);
  return typeof candidate === "string" && candidate.trim()
    ? candidate.trim()
    : null;
}

function numberFor(value: unknown, keys: readonly string[]) {
  const candidate = valueFor(value, keys);
  if (typeof candidate === "number" && Number.isFinite(candidate)) {
    return candidate;
  }
  if (typeof candidate === "string" && candidate.trim()) {
    const parsed = Number(candidate.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isPaystackAuthorizationUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "paystack.com" ||
        url.hostname.endsWith(".paystack.com"))
    );
  } catch {
    return false;
  }
}

function authorizationUrlFor(value: unknown) {
  const explicit = stringFor(value, [
    "authorizationUrl",
    "authorization_url",
    "paymentUrl",
    "payment_url",
    "checkoutUrl",
    "checkout_url",
  ]);
  if (explicit && isPaystackAuthorizationUrl(explicit)) return explicit;

  const genericUrl = stringFor(value, ["url"]);
  return genericUrl && isPaystackAuthorizationUrl(genericUrl)
    ? genericUrl
    : null;
}

function paymentStateFor(value: unknown): PaymentVerificationState {
  const status = stringFor(value, [
    "paymentStatus",
    "payment_status",
    "transactionStatus",
    "transaction_status",
    "status",
  ])?.toUpperCase();

  if (
    status &&
    ["SUCCESS", "SUCCESSFUL", "PAID", "COMPLETED"].includes(status)
  ) {
    return "success";
  }
  if (
    status &&
    ["FAILED", "FAILURE", "CANCELLED", "CANCELED", "ABANDONED"].includes(status)
  ) {
    return "failed";
  }

  const purchaseNumber = stringFor(value, [
    "purchaseNumber",
    "purchase_number",
  ]);
  const newBalance = numberFor(value, ["newBalance", "new_balance"]);
  return purchaseNumber && newBalance !== null ? "success" : "pending";
}

function transactionKindFor(value: unknown): CreditTransactionKind {
  const raw =
    stringFor(value, [
      "kind",
      "type",
      "transactionType",
      "transaction_type",
      "category",
      "direction",
    ])?.toLowerCase() ?? "";
  const points = numberFor(value, [
    "points",
    "creditPoints",
    "credit_points",
    "pointsUsed",
    "points_used",
    "pointsPurchased",
    "points_purchased",
  ]);

  if (/refund|reversal/.test(raw)) return "refund";
  if (/debit|usage|used|spend|feature|listing/.test(raw) || (points ?? 0) < 0) {
    return "usage";
  }
  if (/purchase|payment|credit|top.?up/.test(raw)) return "purchase";
  return "adjustment";
}

function transactionStatusFor(value: unknown): CreditTransactionStatus {
  const state = paymentStateFor(value);
  return state;
}

function transactionsFor(value: unknown, fallbackCurrency: string) {
  const transactions = arrayFor(value, [
    "transactions",
    "transactionHistory",
    "transaction_history",
    "creditTransactions",
    "credit_transactions",
    "history",
    "activities",
    "ledger",
    "purchases",
  ]);

  return transactions.filter(isRecord).map((transaction, index) => {
    const kind = transactionKindFor(transaction);
    const rawPoints =
      numberFor(transaction, [
        "points",
        "creditPoints",
        "credit_points",
        "pointsUsed",
        "points_used",
        "pointsPurchased",
        "points_purchased",
      ]) ?? 0;
    const points = kind === "usage" ? -Math.abs(rawPoints) : rawPoints;
    const reference = stringFor(transaction, [
      "reference",
      "paymentReference",
      "payment_reference",
      "purchaseNumber",
      "purchase_number",
    ]);

    return {
      id:
        stringFor(transaction, ["id", "transactionId", "transaction_id"]) ??
        reference ??
        `credit-transaction-${index}`,
      reference,
      description:
        stringFor(transaction, [
          "description",
          "title",
          "reason",
          "activity",
        ]) ??
        (kind === "purchase"
          ? "Credit points purchase"
          : kind === "usage"
            ? "Credit points used"
            : kind === "refund"
              ? "Credit points refund"
              : "Credit balance adjustment"),
      kind,
      status: transactionStatusFor(transaction),
      points,
      amount: numberFor(transaction, [
        "amountPaid",
        "amount_paid",
        "paymentAmount",
        "payment_amount",
        "totalAmount",
        "total_amount",
        "amount",
      ]),
      currency: stringFor(transaction, ["currency"]) ?? fallbackCurrency,
      createdAt: stringFor(transaction, [
        "createdAt",
        "created_at",
        "paidAt",
        "paid_at",
        "date",
        "updatedAt",
        "updated_at",
      ]),
    } satisfies CreditTransaction;
  });
}

export const creditPaymentService = {
  getCreditInfo: async (): Promise<CreditInfo> => {
    const { data } = await api.get("/credit-points/my-credit");
    const currency = stringFor(data, ["currency"]) ?? "NGN";
    return {
      balance: numberFor(data, [
        "creditBalance",
        "credit_balance",
        "currentBalance",
        "current_balance",
        "availablePoints",
        "available_points",
        "balance",
        "points",
      ]),
      currency,
      minimumPurchasePoints: numberFor(data, [
        "minimumPurchasePoints",
        "minimum_purchase_points",
      ]),
      pricePerPoint: numberFor(data, ["pricePerPoint", "price_per_point"]),
      transactions: transactionsFor(data, currency),
    };
  },

  calculatePurchase: async (points: number): Promise<CreditPurchaseQuote> => {
    const { data } = await api.get("/credit-points/calculate-purchase", {
      params: { points },
    });
    const amount = numberFor(data, [
      "totalAmount",
      "total_amount",
      "amountPayable",
      "amount_payable",
      "totalCost",
      "total_cost",
      "totalPrice",
      "total_price",
      "amount",
      "price",
      "total",
    ]);
    if (amount === null) {
      throw new Error("The payment quote did not include an amount.");
    }
    return {
      points:
        numberFor(data, ["points", "creditPoints", "credit_points"]) ?? points,
      amount,
      currency: stringFor(data, ["currency"]) ?? "NGN",
    };
  },

  initializePurchase: async (
    points: number,
  ): Promise<InitializedCreditPurchase> => {
    const { data } = await api.post("/credit-points/purchase/initialize", {
      points,
    });
    const authorizationUrl = authorizationUrlFor(data);
    if (!authorizationUrl) {
      throw new Error(
        "The backend did not return a valid Paystack authorization URL.",
      );
    }
    return {
      authorizationUrl,
      reference: stringFor(data, [
        "reference",
        "paymentReference",
        "payment_reference",
        "transactionReference",
        "transaction_reference",
      ]),
      points:
        numberFor(data, ["points", "creditPoints", "credit_points"]) ?? points,
      amount: numberFor(data, ["amount", "totalAmount", "total_amount"]) ?? 0,
      currency: stringFor(data, ["currency"]) ?? "NGN",
    };
  },

  verifyPurchase: async (
    reference: string,
  ): Promise<VerifiedCreditPurchase> => {
    const { data } = await api.get(
      `/credit-points/purchase/verify/${encodeURIComponent(reference)}`,
    );
    const state = paymentStateFor(data);
    return {
      state,
      message:
        stringFor(data, ["message"]) ??
        (state === "success"
          ? "Payment verified and credit points added successfully."
          : state === "failed"
            ? "Paystack could not complete this payment."
            : "Your payment is still being confirmed."),
      reference,
      purchaseNumber: stringFor(data, ["purchaseNumber", "purchase_number"]),
      points: numberFor(data, ["points", "creditPoints", "credit_points"]),
      amountPaid: numberFor(data, ["amountPaid", "amount_paid", "amount"]),
      currency: stringFor(data, ["currency"]) ?? "NGN",
      newBalance: numberFor(data, ["newBalance", "new_balance"]),
      paidAt: stringFor(data, ["paidAt", "paid_at"]),
    };
  },
};
