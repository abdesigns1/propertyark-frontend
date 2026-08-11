import type { Metadata } from "next";
import { AdminRedirectScreen } from "@/features/admin/components/admin-redirect-screen";

export const metadata: Metadata = {
  title: "Opening Admin Dashboard | PropertyArk",
};

export default function AdminRedirectingPage() {
  return <AdminRedirectScreen />;
}
