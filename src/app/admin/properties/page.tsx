import type { Metadata } from "next";
import { AdminPropertiesPage } from "@/features/admin/components/admin-properties-page";

export const metadata: Metadata = {
  title: "Property Management | PropertyArk",
};

export default function PropertiesPage() {
  return <AdminPropertiesPage />;
}
