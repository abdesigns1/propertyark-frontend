import { Suspense } from "react";
import { BuyerProperties } from "@/features/dashboard/components/buyer-properties";

export default function BuyerPropertiesPage() {
  return <Suspense fallback={<div className="min-h-[60vh]" />}><BuyerProperties /></Suspense>;
}
