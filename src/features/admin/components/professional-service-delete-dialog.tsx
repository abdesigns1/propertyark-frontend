"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteProfessionalService } from "@/features/professional-services/hooks/use-professional-services";
import { professionalServiceLabel } from "@/features/professional-services/lib/professional-service-options";
import { getApiErrorMessage } from "@/services/api-error";
import type { ProfessionalServiceRequest } from "@/services/professional-service.service";

export function ProfessionalServiceDeleteDialog({
  request,
  open,
  onOpenChange,
  onDeleted,
}: {
  request: ProfessionalServiceRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}) {
  const deleteRequest = useDeleteProfessionalService();

  function confirmDelete() {
    if (!request || deleteRequest.isPending) return;

    deleteRequest.mutate(request.id, {
      onSuccess: () => {
        toast.success("Professional service request deleted.");
        onOpenChange(false);
        onDeleted?.();
      },
      onError: (error) =>
        toast.error(
          getApiErrorMessage(
            error,
            "The professional service request could not be deleted.",
          ),
        ),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!deleteRequest.isPending) onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete professional service request?</DialogTitle>
          <DialogDescription>
            {request
              ? `This will permanently remove the ${professionalServiceLabel(request.serviceType)} request and its submitted information.`
              : "This request will be permanently removed."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={deleteRequest.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!request || deleteRequest.isPending}
            onClick={confirmDelete}
          >
            {deleteRequest.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Trash2 data-icon="inline-start" />
            )}
            {deleteRequest.isPending ? "Deleting..." : "Delete request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
