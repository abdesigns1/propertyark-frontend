import type { Metadata } from "next";
import { AdminNewsletterSubscribersPage } from "@/features/admin/components/admin-newsletter-subscribers-page";

export const metadata: Metadata = {
  title: "Newsletter Subscribers | PropertyArk Admin",
};

export default function AdminNewsletterPage() {
  return <AdminNewsletterSubscribersPage />;
}
