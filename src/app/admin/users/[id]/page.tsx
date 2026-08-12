import type { Metadata } from "next";
import { AdminUserDetail } from "@/features/admin/components/admin-user-detail";

export const metadata: Metadata = { title: "User Information | PropertyArk" };

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminUserDetail userId={id} />;
}
