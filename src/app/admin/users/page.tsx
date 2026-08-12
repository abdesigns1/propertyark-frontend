import type { Metadata } from "next";
import { AdminUsersPage } from "@/features/admin/components/admin-users-page";

export const metadata: Metadata = { title: "User Management | PropertyArk" };

export default function UsersPage() {
  return <AdminUsersPage />;
}
