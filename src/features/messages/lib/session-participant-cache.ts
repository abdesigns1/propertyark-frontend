import type { ChatParticipant } from "@/features/messages/types/chat.types";

const STORAGE_KEY = "propertyark-chat-participants";

type ParticipantCache = Record<string, ChatParticipant>;

function readCache(): ParticipantCache {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "{}",
    ) as ParticipantCache;
  } catch {
    return {};
  }
}

export function getCachedChatParticipant(sessionId: string) {
  return readCache()[sessionId] ?? null;
}

export function cacheChatParticipant(
  sessionId: string,
  participant: ChatParticipant,
) {
  if (typeof window === "undefined" || !sessionId) return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...readCache(),
      [sessionId]: participant,
    }),
  );
}
