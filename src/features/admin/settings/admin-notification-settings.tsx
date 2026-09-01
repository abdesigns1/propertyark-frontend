"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BellRing,
  Bold,
  Italic,
  List,
  ListOrdered,
  Search,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormattedNotificationMessage } from "@/components/notifications/formatted-notification-message";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/services/api-error";
import { adminService } from "@/services/admin.service";
import {
  notificationService,
  type AdminBulkNotificationPayload,
  type AdminNotificationPayload,
} from "@/services/notification.service";

type Audience = "ALL" | "USER" | "VENDOR" | "STAFF";
type RecipientMode = "ALL" | "SPECIFIC";

const initialForm: AdminNotificationPayload = {
  title: "",
  message: "",
  type: "GENERAL",
  channel: "BOTH",
  priority: "NORMAL",
};

export function AdminNotificationSettings({
  initialRecipient,
}: {
  initialRecipient?: { id: string; audience: "USER" | "VENDOR" };
}) {
  const [form, setForm] = useState(initialForm);
  const [audience, setAudience] = useState<Audience>(
    initialRecipient?.audience ?? "ALL",
  );
  const [recipientMode, setRecipientMode] = useState<RecipientMode>(
    initialRecipient ? "SPECIFIC" : "ALL",
  );
  const [recipientSearch, setRecipientSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    initialRecipient ? [initialRecipient.id] : [],
  );
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const recipientsQuery = useQuery({
    queryKey: ["admin", "notification-recipients", audience],
    queryFn: async () => {
      const firstPage = await adminService.getUsers(1, 100);
      const remainingPages = await Promise.all(
        Array.from(
          { length: Math.max(0, firstPage.pagination.pages - 1) },
          (_, index) => adminService.getUsers(index + 2, 100),
        ),
      );
      return {
        ...firstPage,
        users: [
          ...firstPage.users,
          ...remainingPages.flatMap((page) => page.users),
        ],
      };
    },
    enabled: audience === "USER" || audience === "VENDOR",
  });
  const recipients = useMemo(() => {
    const query = recipientSearch.trim().toLowerCase();
    return (recipientsQuery.data?.users ?? []).filter((person) => {
      const role = person.role.toUpperCase();
      const matchesRole =
        audience === "VENDOR"
          ? role === "VENDOR"
          : role === "USER" || role === "BUYER";
      return (
        matchesRole &&
        (!query ||
          person.fullName.toLowerCase().includes(query) ||
          person.email.toLowerCase().includes(query))
      );
    });
  }, [audience, recipientSearch, recipientsQuery.data?.users]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (
        (audience === "USER" || audience === "VENDOR") &&
        recipientMode === "SPECIFIC"
      ) {
        if (selectedUserIds.length === 1) {
          return notificationService.sendToUser({
            ...form,
            userId: selectedUserIds[0],
          });
        }
        return notificationService.sendBulk({
          ...form,
          target: "SPECIFIC",
          userIds: selectedUserIds,
        });
      }
      return notificationService.sendBulk({ ...form, target: audience });
    },
    onSuccess: () => {
      setForm(initialForm);
      setAudience("ALL");
      setRecipientMode("ALL");
      setSelectedUserIds([]);
      setRecipientSearch("");
      toast.success("Notification queued successfully.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Notification could not be sent.")),
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  function wrapMessage(prefix: string, suffix: string, placeholder: string) {
    const textarea = messageRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.message.slice(start, end) || placeholder;
    const next =
      `${form.message.slice(0, start)}${prefix}${selected}${suffix}${form.message.slice(end)}`.slice(
        0,
        2000,
      );
    setForm((current) => ({ ...current, message: next }));
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        Math.min(start + prefix.length + selected.length, next.length),
      );
    });
  }

  function formatList(ordered: boolean) {
    const textarea = messageRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.message.slice(start, end) || "List item";
    const formatted = selected
      .split("\n")
      .map((line, index) => `${ordered ? `${index + 1}.` : "-"} ${line}`)
      .join("\n");
    const next =
      `${form.message.slice(0, start)}${formatted}${form.message.slice(end)}`.slice(
        0,
        2000,
      );
    setForm((current) => ({ ...current, message: next }));
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start,
        Math.min(start + formatted.length, next.length),
      );
    });
  }
  return (
    <form onSubmit={submit}>
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BellRing className="size-5 text-primary" /> Platform Notifications
          </CardTitle>
          <CardDescription>
            Send an in-app notification, email, or both to a supported audience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-5 md:grid-cols-2">
              <SettingsSelect
                label="Audience"
                value={audience}
                items={["ALL", "USER", "VENDOR", "STAFF"]}
                onChange={(value) => {
                  setAudience(value as Audience);
                  setRecipientMode("ALL");
                  setSelectedUserIds([]);
                  setRecipientSearch("");
                }}
              />
              <SettingsSelect
                label="Delivery channel"
                value={form.channel}
                items={["BOTH", "IN_APP", "EMAIL"]}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    channel: value as AdminBulkNotificationPayload["channel"],
                  }))
                }
              />
              <SettingsSelect
                label="Priority"
                value={form.priority}
                items={["LOW", "NORMAL", "HIGH", "URGENT"]}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    priority: value as AdminBulkNotificationPayload["priority"],
                  }))
                }
              />
              <SettingsSelect
                label="Notification type"
                value={form.type}
                items={["GENERAL", "SECURITY", "PROPERTY"]}
                onChange={(value) =>
                  setForm((current) => ({ ...current, type: value }))
                }
              />
            </div>
            {(audience === "USER" || audience === "VENDOR") && (
              <div className="rounded-xl border bg-muted/25 p-4">
                <SettingsSelect
                  label={`${audience === "VENDOR" ? "Vendor" : "User"} recipients`}
                  value={recipientMode}
                  items={["ALL", "SPECIFIC"]}
                  labels={{
                    ALL: `All ${audience === "VENDOR" ? "vendors" : "users"}`,
                    SPECIFIC: `Select ${audience === "VENDOR" ? "vendors" : "users"}`,
                  }}
                  onChange={(value) => {
                    setRecipientMode(value as RecipientMode);
                    setSelectedUserIds([]);
                  }}
                />
                {recipientMode === "SPECIFIC" && (
                  <Field className="mt-4">
                    <FieldLabel>Choose recipients</FieldLabel>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        aria-label="Search notification recipients"
                        className="pl-9"
                        placeholder="Search by name or email"
                        value={recipientSearch}
                        onChange={(event) =>
                          setRecipientSearch(event.target.value)
                        }
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto rounded-lg border bg-background">
                      {recipientsQuery.isLoading ? (
                        <p className="p-4 text-sm text-muted-foreground">
                          Loading recipients…
                        </p>
                      ) : recipientsQuery.isError ? (
                        <p className="p-4 text-sm text-destructive">
                          {getApiErrorMessage(
                            recipientsQuery.error,
                            "Recipients could not be loaded.",
                          )}
                        </p>
                      ) : recipients.length ? (
                        recipients.map((person) => {
                          const checked = selectedUserIds.includes(person.id);
                          return (
                            <label
                              key={person.id}
                              className="flex cursor-pointer items-center gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-muted/50"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(next) =>
                                  setSelectedUserIds((current) =>
                                    next
                                      ? [...current, person.id]
                                      : current.filter(
                                          (id) => id !== person.id,
                                        ),
                                  )
                                }
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium">
                                  {person.fullName}
                                </span>
                                <span className="block truncate text-xs text-muted-foreground">
                                  {person.email}
                                </span>
                              </span>
                            </label>
                          );
                        })
                      ) : (
                        <p className="p-4 text-sm text-muted-foreground">
                          No matching recipients found.
                        </p>
                      )}
                    </div>
                    <FieldDescription>
                      {selectedUserIds.length} selected
                    </FieldDescription>
                  </Field>
                )}
              </div>
            )}
            <Field>
              <FieldLabel htmlFor="notification-title">Title</FieldLabel>
              <Input
                id="notification-title"
                required
                maxLength={120}
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="notification-message">Message</FieldLabel>
              <div
                className="flex flex-wrap gap-1 rounded-t-md border border-b-0 bg-muted/40 p-1"
                role="toolbar"
                aria-label="Message formatting"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Bold"
                  title="Bold"
                  onClick={() => wrapMessage("**", "**", "bold text")}
                >
                  <Bold />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Italic"
                  title="Italic"
                  onClick={() => wrapMessage("_", "_", "italic text")}
                >
                  <Italic />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Bulleted list"
                  title="Bulleted list"
                  onClick={() => formatList(false)}
                >
                  <List />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Numbered list"
                  title="Numbered list"
                  onClick={() => formatList(true)}
                >
                  <ListOrdered />
                </Button>
              </div>
              <Textarea
                ref={messageRef}
                id="notification-message"
                required
                rows={7}
                maxLength={2000}
                className="rounded-t-none"
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
              />
              <FieldDescription>
                Select text before applying bold or italic.{" "}
                {form.message.length}
                /2,000 characters
              </FieldDescription>
            </Field>
            {form.message.trim() && (
              <Field>
                <FieldLabel>Message preview</FieldLabel>
                <FormattedNotificationMessage
                  message={form.message}
                  className="rounded-lg border bg-muted/20 p-4 leading-7"
                />
              </Field>
            )}
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            type="submit"
            disabled={
              mutation.isPending ||
              !form.title.trim() ||
              !form.message.trim() ||
              ((audience === "USER" || audience === "VENDOR") &&
                recipientMode === "SPECIFIC" &&
                selectedUserIds.length === 0)
            }
          >
            <Send data-icon="inline-start" />
            Send notification
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function SettingsSelect({
  label,
  value,
  items,
  labels,
  onChange,
}: {
  label: string;
  value: string;
  items: string[];
  labels?: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item} value={item}>
                {labels?.[item] ??
                  item
                    .replaceAll("_", " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (letter) => letter.toUpperCase())}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
