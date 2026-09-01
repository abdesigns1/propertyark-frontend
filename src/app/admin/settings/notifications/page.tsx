import { AdminNotificationSettings } from "@/features/admin/settings/admin-notification-settings";
import { AdminSettingsShell } from "@/features/admin/settings/admin-settings-shell";

export default async function AdminNotificationSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    audience?: string | string[];
    recipientId?: string | string[];
  }>;
}) {
  const query = await searchParams;
  const audienceValue = Array.isArray(query.audience)
    ? query.audience[0]
    : query.audience;
  const recipientValue = Array.isArray(query.recipientId)
    ? query.recipientId[0]
    : query.recipientId;
  const audience = audienceValue?.toUpperCase();
  let initialRecipient: { id: string; audience: "USER" | "VENDOR" } | undefined;
  if (recipientValue && (audience === "USER" || audience === "VENDOR")) {
    initialRecipient = { id: recipientValue, audience };
  }

  return (
    <AdminSettingsShell>
      <AdminNotificationSettings initialRecipient={initialRecipient} />
    </AdminSettingsShell>
  );
}
