export type TransactionStatus =
  | "pending"
  | "processing"
  | "in-escrow"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";

export type PaymentMethod =
  "paystack" | "flutterwave" | "bank-transfer" | "wallet";

export type TransactionPurpose =
  | "property-purchase"
  | "property-rent"
  | "shortlet-booking"
  | "subscription-payment"
  | "investment"
  | "mortgage-installment";

export interface Transaction {
  id: string;
  propertyId: string;
  buyerId: string;
  vendorId?: string;
  amount: number;
  currency: "NGN" | "USD";
  purpose?: TransactionPurpose;
  status: TransactionStatus;
  method: PaymentMethod;
  reference?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EscrowRecord {
  id: string;
  transactionId: string;
  propertyId: string;
  buyerId: string;
  vendorId: string;
  amount: number;
  currency: "NGN" | "USD";
  status: "funded" | "in-progress" | "released" | "disputed" | "refunded";
  milestones: EscrowMilestone[];
  createdAt: string;
}

export interface EscrowMilestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
}

export interface MortgageApplication {
  id: string;
  propertyId: string;
  buyerId: string;
  loanAmount: number;
  tenureMonths: number;
  status: "submitted" | "under-review" | "approved" | "rejected";
  createdAt: string;
}

export interface InvestmentOpportunity {
  id: string;
  propertyId: string;
  title: string;
  minimumInvestment: number;
  expectedReturnPercent: number;
  durationMonths: number;
  totalUnits: number;
  unitsSold: number;
  status: "open" | "closed" | "fully-funded";
}
