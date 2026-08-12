"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminRoleBadge } from "@/features/admin/components/admin-role-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatAdminDate,
  getUserInitials,
  getVerificationLabel,
} from "@/features/admin/lib/user-display";
import type { AdminUser } from "@/services/admin.service";
import { cn } from "@/lib/utils";

interface AdminUsersTableProps {
  users: AdminUser[];
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function AdminUsersTable({
  users,
  page,
  pages,
  total,
  onPageChange,
}: AdminUsersTableProps) {
  const router = useRouter();
  const firstEntry = users.length ? (page - 1) * 10 + 1 : 0;
  const lastEntry = Math.min(page * 10, total);

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-primary/5">
          <TableRow>
            <TableHead className="w-14 pl-6">
              <Checkbox aria-label="Select all visible users" />
            </TableHead>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Join date</TableHead>
            <TableHead>Last active</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="pr-6 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const verification = getVerificationLabel(user);
            return (
              <TableRow
                key={user.id}
                className="h-[76px] cursor-pointer"
                onClick={() => router.push(`/admin/users/${user.id}`)}
              >
                <TableCell
                  className="pl-6"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox aria-label={`Select ${user.fullName}`} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src={user.avatar ?? undefined} alt="" />
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {getUserInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <AdminRoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-sm font-medium text-success",
                      verification !== "Verified" && "text-warning",
                    )}
                  >
                    ● {verification}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatAdminDate(user.createdAt)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatAdminDate(user.lastLogin)}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 rounded-full bg-success",
                        !user.isVerified && "bg-muted-foreground/40",
                      )}
                    />
                    {user.isVerified ? "Active" : "Pending"}
                  </span>
                </TableCell>
                <TableCell
                  className="pr-6 text-right"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Actions for ${user.fullName}`}
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                  >
                    <MoreHorizontal />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-4 border-t bg-surface/40 px-6 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {firstEntry}-{lastEntry} of {total.toLocaleString()} users
        </p>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                ‹
              </Button>
            </PaginationItem>
            {Array.from(
              { length: Math.min(pages, 3) },
              (_, index) => index + 1,
            ).map((number) => (
              <PaginationItem key={number}>
                <Button
                  variant={number === page ? "default" : "ghost"}
                  size="icon-sm"
                  onClick={() => onPageChange(number)}
                >
                  {number}
                </Button>
              </PaginationItem>
            ))}
            {pages > 3 && (
              <span className="px-2">… {pages.toLocaleString()}</span>
            )}
            <PaginationItem>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page >= pages}
                onClick={() => onPageChange(page + 1)}
              >
                ›
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
