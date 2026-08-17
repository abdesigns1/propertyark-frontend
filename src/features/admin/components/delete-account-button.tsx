"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminActionDialog } from "@/features/admin/components/admin-action-dialog";
import { getApiErrorMessage } from "@/services/api-error";
import { adminService } from "@/services/admin.service";

export function DeleteAccountButton({
  userId,
  fullName,
  role,
}: {
  userId: string;
  fullName: string;
  role: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const isVendor = role.toUpperCase() === "VENDOR";
  const accountType = isVendor ? "vendor" : "user";
  const deletion = useMutation({
    mutationFn: () => adminService.deleteUser(userId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "kyc"] }),
      ]);
      toast.success(
        `${isVendor ? "Vendor" : "User"} account deleted successfully.`,
      );
      setOpen(false);
      router.replace("/admin/users");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          `The ${accountType} account could not be deleted.`,
        ),
      ),
  });

  return (
    <>
      <Button
        variant="destructive"
        className="h-14 justify-start"
        onClick={() => setOpen(true)}
      >
        <Trash2 data-icon="inline-start" />
        Delete {isVendor ? "Vendor" : "User"} Account
      </Button>

      <AdminActionDialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!deletion.isPending) setOpen(nextOpen);
        }}
        icon={Trash2}
        tone="destructive"
        title={`Delete ${accountType} account?`}
        description={
          <>
            This will permanently delete <strong>{fullName}</strong>&apos;s
            account and remove their access to PropertyArk. This action cannot
            be undone.
          </>
        }
        footer={
          <>
            <Button
              variant="outline"
              disabled={deletion.isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deletion.isPending}
              onClick={() => deletion.mutate()}
            >
              {deletion.isPending ? (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                />
              ) : (
                <Trash2 data-icon="inline-start" />
              )}
              {deletion.isPending ? "Deleting..." : "Delete Account"}
            </Button>
          </>
        }
      />
    </>
  );
}
