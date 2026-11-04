import { useAuthStore, type Role } from "@/store/auth.store";

const AUTH_SESSION_CHANNEL = "propertyark-auth-session-channel";
const TOKEN_REQUEST_TIMEOUT_MS = 2_000;

type SessionRequest = {
  type: "session-request";
  requestId: string;
  userId: string | null;
  role: Role;
};

type SessionResponse = {
  type: "session-response";
  requestId: string;
  accessToken: string;
  userId: string | null;
  role: Role;
};

type SessionMessage = SessionRequest | SessionResponse;

type PendingRequest = {
  userId: string | null;
  role: Role;
  resolve: (accessToken: string | null) => void;
  timeout: ReturnType<typeof setTimeout>;
};

let authChannel: BroadcastChannel | null = null;
const pendingRequests = new Map<string, PendingRequest>();

function isSessionMessage(value: unknown): value is SessionMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<SessionMessage>;
  return (
    (message.type === "session-request" ||
      message.type === "session-response") &&
    typeof message.requestId === "string"
  );
}

function handleSessionMessage(event: MessageEvent<unknown>) {
  if (!isSessionMessage(event.data)) return;

  if (event.data.type === "session-request") {
    const state = useAuthStore.getState();
    if (
      !state.accessToken ||
      !state.isAuthenticated ||
      !state.role ||
      state.userId !== event.data.userId ||
      state.role !== event.data.role
    ) {
      return;
    }

    authChannel?.postMessage({
      type: "session-response",
      requestId: event.data.requestId,
      accessToken: state.accessToken,
      userId: state.userId,
      role: state.role,
    } satisfies SessionResponse);
    return;
  }

  const pending = pendingRequests.get(event.data.requestId);
  if (
    !pending ||
    pending.userId !== event.data.userId ||
    pending.role !== event.data.role
  ) {
    return;
  }

  clearTimeout(pending.timeout);
  pendingRequests.delete(event.data.requestId);
  pending.resolve(event.data.accessToken);
}

function getAuthChannel() {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return null;
  }

  if (!authChannel) {
    authChannel = new BroadcastChannel(AUTH_SESSION_CHANNEL);
    authChannel.addEventListener("message", handleSessionMessage);
  }

  return authChannel;
}

/**
 * Starts the same-origin channel used by an authenticated tab to answer a new
 * tab's token request. BroadcastChannel keeps the bearer token out of
 * localStorage while still allowing an already-open session to continue.
 */
export function activateAuthSessionChannel() {
  getAuthChannel();
}

export function requestAccessTokenFromOpenTab({
  userId,
  role,
}: {
  userId: string | null;
  role: Role;
}) {
  const channel = getAuthChannel();
  if (!channel) return Promise.resolve<string | null>(null);

  const requestId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return new Promise<string | null>((resolve) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId);
      resolve(null);
    }, TOKEN_REQUEST_TIMEOUT_MS);

    pendingRequests.set(requestId, { userId, role, resolve, timeout });
    channel.postMessage({
      type: "session-request",
      requestId,
      userId,
      role,
    } satisfies SessionRequest);
  });
}
