import type { Metadata } from "next";
import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { StaffSetupForm } from "@/features/admin/components/staff-setup-form";

export const metadata: Metadata = {
  title: "Complete Admin Setup | PropertyArk",
};

export default function AdminSetupPage() {
  return (
    <AdminAuthShell
      title="Complete Admin Setup"
      description="Welcome, fill the form below to set up your staff account."
    >
      <StaffSetupForm />
    </AdminAuthShell>
  );
}
