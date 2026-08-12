"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { AdminUsersTable } from "@/features/admin/components/admin-users-table";
import { AdminUserStatsCards } from "@/features/admin/components/admin-user-stats";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import {
  useAdminUsers,
  useAdminUserStats,
} from "@/features/admin/hooks/use-admin-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const userFilters = [
  { value: "all", label: "All Users" },
  { value: "user", label: "Users" },
  { value: "vendor", label: "Vendors" },
  { value: "admin", label: "Admins" },
] as const;

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const usersQuery = useAdminUsers(page, 10);
  const statsQuery = useAdminUserStats();
  const users = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return (usersQuery.data?.users ?? []).filter((user) => {
      const matchesRole =
        filter === "all" || user.role.toLowerCase() === filter;
      const matchesSearch =
        !normalizedSearch ||
        `${user.fullName} ${user.email}`
          .toLowerCase()
          .includes(normalizedSearch);
      return matchesRole && matchesSearch;
    });
  }, [filter, search, usersQuery.data?.users]);

  function exportCsv() {
    const header = [
      "Name",
      "Email",
      "Role",
      "Verified",
      "Joined",
      "Last active",
    ];
    const rows = users.map((user) => [
      user.fullName,
      user.email,
      user.role,
      user.isVerified ? "Yes" : "No",
      user.createdAt,
      user.lastLogin ?? "",
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `propertyark-users-page-${page}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              User Management
            </h1>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-2 rounded-full bg-success" />
              Manage your Platform Total Users
            </p>
          </div>
          <Button
            variant="outline"
            onClick={exportCsv}
            disabled={!users.length}
          >
            <Download data-icon="inline-start" />
            Export CSV
          </Button>
        </section>

        <section className="mt-8">
          <AdminUserStatsCards
            stats={statsQuery.data}
            isLoading={statsQuery.isLoading}
          />
        </section>

        <section className="mt-8 flex flex-col gap-4 border-b sm:flex-row sm:items-end sm:justify-between">
          <Tabs
            value={filter}
            onValueChange={(value) => {
              setFilter(value);
              setPage(1);
            }}
          >
            <TabsList variant="line" className="h-auto gap-2 overflow-x-auto">
              {userFilters.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className={cn(
                    "relative rounded-none px-5 py-4 text-base after:hidden",
                    filter === item.value && "font-semibold text-primary",
                  )}
                >
                  <span>{item.label}</span>
                  {filter === item.value && (
                    <span className="absolute inset-x-2 bottom-0 h-0.5 bg-primary" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative mb-3 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users..."
              className="pl-10"
            />
          </div>
        </section>

        <section className="mt-6">
          {usersQuery.isLoading ? (
            <Skeleton className="h-[560px] w-full" />
          ) : (
            <AdminUsersTable
              users={users}
              page={usersQuery.data?.pagination.page ?? page}
              pages={usersQuery.data?.pagination.pages ?? 1}
              total={usersQuery.data?.pagination.total ?? 0}
              onPageChange={setPage}
            />
          )}
        </section>
      </main>
    </AdminWorkspace>
  );
}
