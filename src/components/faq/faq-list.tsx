"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
  category:
    | "getting-started"
    | "searching"
    | "listing"
    | "bookings"
    | "payments-accounts";
  links?: Array<{ label: string; href: string }>;
}

export function FaqList({
  items,
  openFirst = true,
}: {
  items: FaqItem[];
  openFirst?: boolean;
}) {
  const [openItem, setOpenItem] = useState<string | null>(
    openFirst ? (items[0]?.question ?? null) : null,
  );

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const isOpen = openItem === item.question;

        return (
          <Collapsible
            key={item.question}
            open={isOpen}
            onOpenChange={(open) =>
              setOpenItem(open ? item.question : null)
            }
            className="rounded-xl border bg-card px-5 shadow-sm transition-shadow data-[state=open]:border-primary/25 data-[state=open]:shadow-md"
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 py-5 text-left font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <span>{item.question}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors",
                  isOpen && "bg-primary/10 text-primary",
                )}
              >
                {isOpen ? (
                  <Minus className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pb-5 text-sm leading-7 text-muted-foreground">
              <p>{item.answer}</p>
              {item.links?.length ? (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                  {item.links.map((link) => (
                    <Link
                      key={`${item.question}-${link.href}`}
                      href={link.href}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
