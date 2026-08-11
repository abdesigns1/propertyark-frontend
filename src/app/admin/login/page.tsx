import type { Metadata } from "next";
import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { AdminLoginForm } from "@/features/admin/components/admin-login-form";

export const metadata: Metadata = { title: "Admin Sign In | PropertyArk" };

export default function AdminLoginPage() {
  return (
    <AdminAuthShell
      title="Admin Sign In"
      description="Please enter your information to proceed with login."
      compact
    >
      <AdminLoginForm />
    </AdminAuthShell>
  );
}
