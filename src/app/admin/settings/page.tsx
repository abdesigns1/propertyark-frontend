import { AdminGeneralSettings } from "@/features/admin/settings/admin-general-settings";
import { AdminSettingsShell } from "@/features/admin/settings/admin-settings-shell";

export default function AdminSettingsPage() {
  return (
    <AdminSettingsShell>
      <AdminGeneralSettings />
    </AdminSettingsShell>
  );
}
