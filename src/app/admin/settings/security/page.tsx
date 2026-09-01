import { AdminSecuritySettings } from "@/features/admin/settings/admin-security-settings";
import { AdminSettingsShell } from "@/features/admin/settings/admin-settings-shell";

export default function AdminSecuritySettingsPage() {
  return (
    <AdminSettingsShell>
      <AdminSecuritySettings />
    </AdminSettingsShell>
  );
}
