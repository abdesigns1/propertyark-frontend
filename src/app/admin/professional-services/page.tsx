import type { Metadata } from "next";
import { AdminProfessionalServicesPage } from "@/features/admin/components/admin-professional-services-page";

export const metadata: Metadata = {
  title: "Professional Services | PropertyArk Admin",
};

export default function ProfessionalServicesAdminPage() {
  return <AdminProfessionalServicesPage />;
}
