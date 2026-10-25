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
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
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
          <WhatsAppIcon data-icon="inline-start" />
        </a>
      </Button>
    </div>
  );
}
