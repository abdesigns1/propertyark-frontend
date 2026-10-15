import type { Metadata } from "next";
import { AdminContactMessagesPage } from "@/features/admin/components/admin-contact-messages-page";

export const metadata: Metadata = {
  title: "Contact Messages | PropertyArk Admin",
};

export default function AdminContactsPage() {
  return <AdminContactMessagesPage />;
}
