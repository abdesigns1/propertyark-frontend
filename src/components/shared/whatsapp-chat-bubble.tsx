"use client";

import { useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const WHATSAPP_PHONE_NUMBER = "2349134127050";
const WHATSAPP_GREETING =
  "Hello PropertyArk, I would like to make an enquiry.";
const WHATSAPP_CHAT_URL = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(WHATSAPP_GREETING)}`;
const WHATSAPP_PROMPT_DISMISSED_KEY =
  "propertyark-whatsapp-prompt-dismissed";
const WHATSAPP_PROMPT_CHANGED_EVENT = "propertyark:whatsapp-prompt-changed";

let promptDismissedForPage = false;

function subscribeToPromptPreference(onStoreChange: () => void) {
  function handleStorageChange(event: StorageEvent) {
    if (event.key === WHATSAPP_PROMPT_DISMISSED_KEY) onStoreChange();
  }

  window.addEventListener(WHATSAPP_PROMPT_CHANGED_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(WHATSAPP_PROMPT_CHANGED_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}

function getPromptPreferenceSnapshot() {
  if (promptDismissedForPage) return false;

  try {
    return (
      window.localStorage.getItem(WHATSAPP_PROMPT_DISMISSED_KEY) !== "true"
    );
  } catch {
    return true;
  }
}

function getPromptPreferenceServerSnapshot() {
  return false;
}

function WhatsAppIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.45L3 20.5l1.55-4.75A8.5 8.5 0 1 1 20.5 11.5Z" />
      <path d="M8.1 7.7c.35 3.35 2.85 5.85 6.2 6.2l1.45-1.45-2.15-1.05-.8.8a6.1 6.1 0 0 1-2.95-2.95l.8-.8L9.6 6.3 8.1 7.7Z" />
    </svg>
  );
}

export function WhatsAppChatBubble() {
  const showPrompt = useSyncExternalStore(
    subscribeToPromptPreference,
    getPromptPreferenceSnapshot,
    getPromptPreferenceServerSnapshot,
  );

  function dismissPrompt() {
    promptDismissedForPage = true;

    try {
      window.localStorage.setItem(WHATSAPP_PROMPT_DISMISSED_KEY, "true");
    } catch {
      // The prompt still closes for this page view if storage is unavailable.
    }

    window.dispatchEvent(new Event(WHATSAPP_PROMPT_CHANGED_EVENT));
  }

  return (
    <div className="fixed right-4 bottom-20 z-40 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 sm:right-6 md:flex-row md:items-end">
      {showPrompt && (
        <Card
          size="sm"
          className="w-[min(25rem,calc(100vw-2rem))] shadow-xl ring-success/40"
        >
          <CardHeader>
            <Badge className="bg-success/10 text-success hover:bg-success/10">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-success"
              />
              Always active
            </Badge>
            <CardTitle className="max-w-72 text-lg font-semibold sm:text-xl">
              Need help? Send us a direct message.
            </CardTitle>
            <CardAction>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={dismissPrompt}
                aria-label="Dismiss WhatsApp message"
              >
                <X aria-hidden="true" />
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      )}

      <Button
        asChild
        variant="success"
        size="icon-lg"
        className="size-14 rounded-full shadow-lg shadow-black/15 [&_svg:not([class*='size-'])]:size-7"
      >
        <a
          href={WHATSAPP_CHAT_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with PropertyArk on WhatsApp"
        >
          <WhatsAppIcon />
        </a>
      </Button>
    </div>
  );
}
