"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqList({ items }: { items: FaqItem[] }) {
  const [openItem, setOpenItem] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => {
        const isOpen = openItem === index;

        return (
          <Collapsible
            key={item.question}
            open={isOpen}
            onOpenChange={(open) => setOpenItem(open ? index : null)}
            className="rounded-xl border bg-card px-5 shadow-sm transition-shadow data-[state=open]:shadow-md"
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 py-5 text-left font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <span>{item.question}</span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "size-5 shrink-0 text-primary transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pb-5 text-sm leading-7 text-muted-foreground">
              {item.answer}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
