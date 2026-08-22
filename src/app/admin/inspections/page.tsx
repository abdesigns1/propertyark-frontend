import type { Metadata } from "next";
import { AdminInspectionsPage } from "@/features/admin/components/admin-inspections-page";

export const metadata: Metadata = {
  title: "Inspection Management | PropertyArk",
};

export default function InspectionsPage() {
  return <AdminInspectionsPage />;
}
