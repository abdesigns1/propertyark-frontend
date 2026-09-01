"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { adminSettingsNavigation } from "@/features/admin/settings/admin-settings-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdminSettingsShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">
            Admin Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your administrator account, security, and platform
            communications.
          </p>
        </header>
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                  Settings categories
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                {adminSettingsNavigation.map(
                  ({ label, href, icon: Icon, external }) => {
                    const active = !external && pathname === href;
                    return (
                      <Link
                        key={label}
                        href={href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                          active &&
                            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                        <span>{label}</span>
                        {external && (
                          <ArrowUpRight className="ml-auto size-3.5" />
                        )}
                      </Link>
                    );
                  },
                )}
              </CardContent>
            </Card>
            <Card className="border-primary/15 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="size-4 text-primary" /> Secure
                  administration
                </CardTitle>
                <CardDescription>
                  Changes are sent directly to the authenticated PropertyArk
                  API.
                </CardDescription>
              </CardHeader>
            </Card>
          </aside>
          <section className="min-w-0">{children}</section>
        </div>
      </main>
    </AdminWorkspace>
  );
}
