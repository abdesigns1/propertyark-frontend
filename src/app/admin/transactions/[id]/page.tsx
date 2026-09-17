import type { Metadata } from "next";
import { AdminTransactionDetailsPage } from "@/features/admin/components/admin-transaction-details-page";

export const metadata: Metadata = {
  title: "Transaction Details | PropertyArk",
};

export default async function TransactionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminTransactionDetailsPage transactionId={id} />;
}
