"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { chatKeys } from "@/features/messages/hooks/use-chat";
import { cacheChatParticipant } from "@/features/messages/lib/session-participant-cache";
import { getApiErrorMessage } from "@/services/api-error";
import { chatService } from "@/services/chat.service";
import type { VendorInspection } from "@/services/inspection.service";
import type { ChatSession } from "@/features/messages/types/chat.types";

export function useInspectionConversation(inspection: VendorInspection) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const conversation = useMutation({
    mutationFn: async () => {
      if (!inspection.userId) {
        throw new Error(
          "This inspection does not include the user's account ID. Please refresh the inspection and try again.",
        );
      }

      const reference =
        inspection.inspectionReference ?? inspection.id.slice(-8).toUpperCase();

      return chatService.createDirect({
        participantId: inspection.userId,
        propertyId: inspection.propertyId ?? undefined,
        subject: `Inspection ${reference}: ${inspection.propertyName}`,
      });
    },
    onSuccess: (session) => {
      const participant = {
        id: inspection.userId ?? "",
        name: inspection.userName,
        avatarUrl: inspection.userAvatarUrl,
        role: "USER",
        isOnline: false,
      };
      cacheChatParticipant(session.id, participant);
      queryClient.setQueriesData<ChatSession[]>(
        { queryKey: ["chat", "sessions"] },
        (current) =>
          current?.map((item) =>
            item.id === session.id ? { ...item, participant } : item,
          ),
      );
      void queryClient.invalidateQueries({ queryKey: chatKeys.all });
      const params = new URLSearchParams({
        session: session.id,
        propertyTitle: inspection.propertyName,
        participantName: inspection.userName,
      });
      if (inspection.propertyId) {
        params.set("property", inspection.propertyId);
      }
      router.push(`/vendor/messages?${params.toString()}`);
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "The inspection conversation could not be opened.",
        ),
      );
    },
  });

  return {
    openConversation: () => conversation.mutate(),
    isOpeningConversation: conversation.isPending,
  };
}
