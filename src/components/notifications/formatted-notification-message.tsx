import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FormattedNotificationMessage({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {message.split("\n").map((line, index) => {
        const bullet = line.match(/^\s*[-*]\s+(.+)$/);
        const numbered = line.match(/^\s*(\d+)\.\s+(.+)$/);

        if (bullet) {
          return (
            <div key={index} className="flex gap-2 pl-1">
              <span aria-hidden>•</span>
              <span>{formatInline(bullet[1], index)}</span>
            </div>
          );
        }
        if (numbered) {
          return (
            <div key={index} className="flex gap-2 pl-1">
              <span>{numbered[1]}.</span>
              <span>{formatInline(numbered[2], index)}</span>
            </div>
          );
        }
        if (!line.trim()) return <span key={index} className="h-2" />;
        return <p key={index}>{formatInline(line, index)}</p>;
      })}
    </div>
  );
}

function formatInline(value: string, lineIndex: number): ReactNode[] {
  return value
    .split(/(\*\*[^*]+\*\*|_[^_]+_)/g)
    .filter(Boolean)
    .map((part, index) => {
      const key = `${lineIndex}-${index}`;
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={key}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("_") && part.endsWith("_")) {
        return <em key={key}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
}
