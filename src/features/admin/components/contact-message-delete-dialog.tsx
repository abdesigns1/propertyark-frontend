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
import { useDeleteContactMessage } from "@/features/messages/hooks/use-contact-messages";
import { getApiErrorMessage } from "@/services/api-error";
import type { ContactMessage } from "@/services/contact.service";

export function ContactMessageDeleteDialog({
  contact,
  open,
  onOpenChange,
  onDeleted,
}: {
  contact: ContactMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}) {
  const deleteContact = useDeleteContactMessage();

  function confirmDelete() {
    if (!contact || deleteContact.isPending) return;

    deleteContact.mutate(contact.id, {
      onSuccess: () => {
        toast.success("Contact message deleted.");
        onOpenChange(false);
        onDeleted?.();
      },
      onError: (error) =>
        toast.error(
          getApiErrorMessage(
            error,
            "The contact message could not be deleted.",
          ),
        ),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!deleteContact.isPending) onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete contact message?</DialogTitle>
          <DialogDescription>
            {contact
              ? `This will permanently remove the message from ${contact.fullName || contact.email || "this sender"}.`
              : "This contact message will be permanently removed."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={deleteContact.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!contact || deleteContact.isPending}
            onClick={confirmDelete}
          >
            {deleteContact.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Trash2 data-icon="inline-start" />
            )}
            {deleteContact.isPending ? "Deleting..." : "Delete message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
