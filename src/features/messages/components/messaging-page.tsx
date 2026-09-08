"use client";

import { useMemo, useState } from "react";
import {
  CircleDollarSign,
  MessageCircle,
  MessageSquarePlus,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  messagePreviewData,
  type ConversationPreview,
} from "@/features/messages/data/message-preview-data";
import { useDashboardUser } from "@/features/dashboard/hooks/use-dashboard-user";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface MessagingPageProps {
  role: "buyer" | "vendor";
}

export function MessagingPage({ role }: MessagingPageProps) {
  const user = useDashboardUser();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const conversations = messagePreviewData(role);
  const visibleConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((conversation) =>
      `${conversation.name} ${conversation.preview}`
        .toLowerCase()
        .includes(term),
    );
  }, [conversations, search]);
  const selected = conversations.find(({ id }) => id === selectedId) ?? null;
  const counterpart = role === "vendor" ? "clients" : "vendors";

  return (
    <section className="mx-auto min-h-[calc(100dvh-118px)] max-w-[1500px] overflow-hidden rounded-2xl border bg-background shadow-sm lg:grid lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside
        className={cn(
          "flex min-h-[calc(100dvh-118px)] flex-col border-r bg-background",
          selected && "hidden lg:flex",
        )}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-6 pb-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              UI preview · messaging connection coming next
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Start a new conversation"
            title="Start a new conversation"
            disabled
          >
            <MessageSquarePlus />
          </Button>
        </div>

        <div className="px-4 pb-5">
          <InputGroup className="h-12 bg-muted/40">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
            />
          </InputGroup>
        </div>

        <div className="flex items-center gap-2 px-5 pb-3 text-xs font-medium text-muted-foreground">
          <MessageCircle />
          All conversations
          <Badge variant="secondary" className="ml-auto">
            {visibleConversations.length}
          </Badge>
        </div>
        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {visibleConversations.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              conversation={conversation}
              selected={conversation.id === selectedId}
              onSelect={() => setSelectedId(conversation.id)}
            />
          ))}
          {!visibleConversations.length && (
            <Empty className="min-h-64 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search />
                </EmptyMedia>
                <EmptyTitle>No conversations found</EmptyTitle>
                <EmptyDescription>
                  Try searching with another name or keyword.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </aside>

      <div
        className={cn(
          "min-h-[calc(100dvh-118px)] bg-primary/[0.02]",
          !selected && "hidden lg:block",
        )}
      >
        {selected ? (
          <ConversationPreviewPanel
            conversation={selected}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <WelcomePanel
            firstName={user.firstName}
            initials={user.initials}
            avatarUrl={user.avatarUrl}
            counterpart={counterpart}
            unread={conversations.reduce(
              (total, conversation) => total + conversation.unread,
              0,
            )}
          />
        )}
      </div>
    </section>
  );
}

function ConversationRow({
  conversation,
  selected,
  onSelect,
}: {
  conversation: ConversationPreview;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "bg-primary/5",
      )}
    >
      <Avatar size="lg">
        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
          {conversation.initials}
        </AvatarFallback>
        {conversation.online && (
          <AvatarBadge className="bg-success ring-background" />
        )}
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">{conversation.name}</p>
          <time className="shrink-0 text-[11px] text-muted-foreground">
            {conversation.time}
          </time>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <p className="truncate text-xs text-muted-foreground">
            {conversation.preview}
          </p>
          {conversation.unread > 0 && (
            <Badge className="ml-auto min-w-5 justify-center px-1.5">
              {conversation.unread}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}

function WelcomePanel({
  firstName,
  initials,
  avatarUrl,
  counterpart,
  unread,
}: {
  firstName: string;
  initials: string;
  avatarUrl?: string;
  counterpart: string;
  unread: number;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-118px)] items-center justify-center p-6 lg:p-12">
      <Empty className="w-full max-w-2xl border-0">
        <EmptyHeader className="gap-4">
          <Avatar className="size-20">
            <AvatarImage src={avatarUrl} alt={firstName} />
            <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
              {initials}
            </AvatarFallback>
            <AvatarBadge className="size-4 bg-success ring-4 ring-background" />
          </Avatar>
          <div>
            <EmptyTitle className="text-2xl font-semibold">
              Welcome back, {firstName}
            </EmptyTitle>
            <EmptyDescription className="mt-1 text-base">
              Ready to connect with your {counterpart}?
            </EmptyDescription>
          </div>
        </EmptyHeader>

        <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
          <Feature icon={MessageCircle} title="Real-time chat">
            Keep property conversations organised in one place.
          </Feature>
          <Feature icon={ShieldCheck} title="Secure conversations">
            Communicate through your authenticated PropertyArk account.
          </Feature>
        </div>

        <EmptyContent>
          <p className="flex items-center gap-2 text-sm font-medium">
            <MessageCircle className="size-4" /> Select a conversation
          </p>
          <EmptyDescription>
            Choose a contact from the message list to open the conversation.
          </EmptyDescription>
          {unread > 0 && (
            <Badge variant="secondary">{unread} preview messages waiting</Badge>
          )}
        </EmptyContent>
      </Empty>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MessageCircle;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border bg-background/80 p-5 text-center shadow-sm">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

function ConversationPreviewPanel({
  conversation,
  onBack,
}: {
  conversation: ConversationPreview;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-118px)] flex-col">
      <header className="flex h-20 items-center gap-3 border-b px-4 sm:px-6">
        <Button variant="ghost" onClick={onBack} className="lg:hidden">
          Back
        </Button>
        <Avatar size="lg">
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
            {conversation.initials}
          </AvatarFallback>
          {conversation.online && <AvatarBadge className="bg-success" />}
        </Avatar>
        <div>
          <p className="font-semibold">{conversation.name}</p>
          <p className="text-xs text-muted-foreground">
            {conversation.online ? "Online" : "Offline"}
          </p>
        </div>
      </header>
      <Empty className="border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleDollarSign />
          </EmptyMedia>
          <EmptyTitle>Conversation preview</EmptyTitle>
          <EmptyDescription>
            Message history and sending will be connected during the messaging
            integration phase.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
      <footer className="border-t p-4 sm:p-5">
        <InputGroup className="h-12 bg-muted/30">
          <InputGroupInput
            disabled
            placeholder="Messaging will be enabled after API integration"
            aria-label="Message composer preview"
          />
          <InputGroupAddon align="inline-end">
            <Button disabled>Send</Button>
          </InputGroupAddon>
        </InputGroup>
      </footer>
    </div>
  );
}
