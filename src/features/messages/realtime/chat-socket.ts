import { io, type Socket } from "socket.io-client";

const DEFAULT_SOCKET_URL = "https://propertyark-backend.onrender.com";

export const chatSocketEvents = {
  join: process.env.NEXT_PUBLIC_CHAT_SOCKET_JOIN_EVENT || "join-session",
  leave: process.env.NEXT_PUBLIC_CHAT_SOCKET_LEAVE_EVENT || "leave-session",
  message: process.env.NEXT_PUBLIC_CHAT_SOCKET_MESSAGE_EVENT || "new-message",
} as const;

let chatSocket: Socket | null = null;
let activeToken: string | null = null;

function socketUrl() {
  const configured = process.env.NEXT_PUBLIC_CHAT_SOCKET_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!apiUrl) return DEFAULT_SOCKET_URL;

  try {
    return new URL(apiUrl).origin;
  } catch {
    return DEFAULT_SOCKET_URL;
  }
}

function socketAuth(token: string) {
  const key = process.env.NEXT_PUBLIC_CHAT_SOCKET_TOKEN_KEY || "token";
  const prefix = process.env.NEXT_PUBLIC_CHAT_SOCKET_TOKEN_PREFIX ?? "";
  return { [key]: `${prefix}${token}` };
}

export function getChatSocket(token: string) {
  if (chatSocket && activeToken === token) return chatSocket;

  chatSocket?.disconnect();
  activeToken = token;
  chatSocket = io(socketUrl(), {
    path: process.env.NEXT_PUBLIC_CHAT_SOCKET_PATH || "/socket.io",
    auth: socketAuth(token),
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
    timeout: 15_000,
    transports: ["websocket", "polling"],
  });

  return chatSocket;
}

export function disconnectChatSocket() {
  chatSocket?.disconnect();
  chatSocket = null;
  activeToken = null;
}
