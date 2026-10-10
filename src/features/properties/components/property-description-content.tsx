import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { cn } from "@/lib/utils";

interface PropertyDescriptionContentProps {
  description: string;
  className?: string;
  emptyText?: string;
}

export function PropertyDescriptionContent({
  description,
  className,
  emptyText = "No description supplied.",
}: PropertyDescriptionContentProps) {
  const content = description.trim() || emptyText;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        components={{
          p: ({ children }) => <p>{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => <em>{children}</em>,
          ul: ({ children }) => <ul className="list-disc pl-5">{children}</ul>,
          ol: ({ children }) => (
            <ol className="list-decimal pl-5">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
