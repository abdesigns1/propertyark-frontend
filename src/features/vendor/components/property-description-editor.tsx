"use client";

import { useRef } from "react";
import { Bold, Italic, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface PropertyDescriptionEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  invalid?: boolean;
}

export function PropertyDescriptionEditor({
  id,
  value,
  onChange,
  maxLength,
  placeholder,
  invalid = false,
}: PropertyDescriptionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyInlineFormat(marker: "**" | "*") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selectedText = value.slice(selectionStart, selectionEnd);
    const fallbackText = marker === "**" ? "bold text" : "italic text";
    const formattedText = `${marker}${selectedText || fallbackText}${marker}`;
    const nextValue = `${value.slice(0, selectionStart)}${formattedText}${value.slice(selectionEnd)}`;

    if (nextValue.length > maxLength) return;
    onChange(nextValue);

    const nextSelectionStart = selectionStart + marker.length;
    const nextSelectionEnd =
      nextSelectionStart + (selectedText || fallbackText).length;
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
    });
  }

  function applyBulletList() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const nextLineBreak = value.indexOf("\n", selectionEnd);
    const lineEnd = nextLineBreak === -1 ? value.length : nextLineBreak;
    const selectedLines = value.slice(lineStart, lineEnd).split("\n");
    const isBulletList = selectedLines.every((line) => /^\s*-\s/.test(line));
    const formattedLines = selectedLines.map((line) =>
      isBulletList ? line.replace(/^(\s*)-\s/, "$1") : `- ${line}`,
    );
    const formattedText = formattedLines.join("\n");
    const nextValue = `${value.slice(0, lineStart)}${formattedText}${value.slice(lineEnd)}`;

    if (nextValue.length > maxLength) return;
    onChange(nextValue);

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart, lineStart + formattedText.length);
    });
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        invalid && "border-destructive ring-3 ring-destructive/20",
      )}
    >
      <div
        role="toolbar"
        aria-label="Property description formatting"
        className="flex items-center gap-1 border-b bg-muted/40 p-1.5"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Bold"
          aria-label="Format selected text as bold"
          onClick={() => applyInlineFormat("**")}
        >
          <Bold data-icon="inline-start" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Italic"
          aria-label="Format selected text as italic"
          onClick={() => applyInlineFormat("*")}
        >
          <Italic data-icon="inline-start" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Bullet list"
          aria-label="Format selected lines as a bullet list"
          onClick={applyBulletList}
        >
          <List data-icon="inline-start" aria-hidden="true" />
        </Button>
      </div>
      <Textarea
        ref={textareaRef}
        id={id}
        className="min-h-40 resize-y rounded-none border-0 shadow-none focus-visible:border-transparent focus-visible:ring-0"
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid}
      />
    </div>
  );
}
