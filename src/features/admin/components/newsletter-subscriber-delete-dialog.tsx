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
import { useDeleteNewsletterSubscriber } from "@/features/newsletter/hooks/use-newsletter";
import { getApiErrorMessage } from "@/services/api-error";
import type { NewsletterSubscriber } from "@/services/newsletter.service";

export function NewsletterSubscriberDeleteDialog({
  subscriber,
  open,
  onOpenChange,
}: {
  subscriber: NewsletterSubscriber | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteSubscriber = useDeleteNewsletterSubscriber();

  function confirmDelete() {
    if (!subscriber || deleteSubscriber.isPending) return;

    deleteSubscriber.mutate(subscriber.id, {
      onSuccess: () => {
        toast.success("Newsletter subscriber deleted.");
        onOpenChange(false);
      },
      onError: (error) =>
        toast.error(
          getApiErrorMessage(error, "The subscriber could not be deleted."),
        ),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!deleteSubscriber.isPending) onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete newsletter subscriber?</DialogTitle>
          <DialogDescription>
            {subscriber
              ? `This will permanently remove ${subscriber.email || "this subscriber"} from the newsletter records.`
              : "This subscriber will be permanently removed."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={deleteSubscriber.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!subscriber || deleteSubscriber.isPending}
            onClick={confirmDelete}
          >
            {deleteSubscriber.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Trash2 data-icon="inline-start" />
            )}
            {deleteSubscriber.isPending ? "Deleting..." : "Delete subscriber"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
