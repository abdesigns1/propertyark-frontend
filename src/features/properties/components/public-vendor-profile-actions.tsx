"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, MessageSquare, Phone, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/services/api-error";
import { chatService } from "@/services/chat.service";
import { useAuthStore } from "@/store/auth.store";

interface PublicVendorProfileActionsProps {
  vendorId: string;
  vendorName: string;
  phone: string | null;
}

export function PublicVendorProfileActions({
  vendorId,
  vendorName,
  phone,
}: PublicVendorProfileActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const profilePath = `/vendors/${encodeURIComponent(vendorId)}`;
  const directChat = useMutation({
    mutationFn: chatService.createDirect,
    onSuccess: (session) => {
      void queryClient.invalidateQueries({ queryKey: ["chat", "sessions"] });
      const dashboard = role === "vendor" ? "vendor" : "buyer";
      router.push(
        `/${dashboard}/messages?session=${encodeURIComponent(session.id)}`,
      );
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The conversation could not be started."),
      ),
  });

  function requireAuthentication(action: string) {
    if (isAuthenticated) return true;
    toast.info(`Please log in to ${action}.`);
    router.push(`/login?redirect=${encodeURIComponent(profilePath)}`);
    return false;
  }

  function callVendor() {
    if (!requireAuthentication("view the vendor contact")) return;
    if (!phone) {
      toast.error("This vendor has not added a phone number yet.");
      return;
    }
    window.location.href = `tel:${phone}`;
  }

  function messageVendor() {
    if (!requireAuthentication("message the vendor")) return;
    if (role === "admin" || role === "staff") {
      toast.info("Open the admin user profile to contact this vendor.");
      return;
    }
    directChat.mutate({
      participantId: vendorId,
      subject: `Profile inquiry for ${vendorName}`,
    });
  }

  async function shareProfile() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: vendorName, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Vendor profile link copied.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("The profile link could not be shared.");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" onClick={callVendor}>
        <Phone data-icon="inline-start" />
        Call vendor
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={messageVendor}
        disabled={directChat.isPending}
      >
        {directChat.isPending ? (
          <LoaderCircle className="animate-spin" data-icon="inline-start" />
        ) : (
          <MessageSquare data-icon="inline-start" />
        )}
        {directChat.isPending ? "Opening..." : "Send a message"}
      </Button>
      <Button type="button" variant="outline" onClick={shareProfile}>
        <Share2 data-icon="inline-start" />
        Share profile
      </Button>
    </div>
  );
}
