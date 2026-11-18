"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CalendarCheck2,
  CircleHelp,
  Compass,
  CreditCard,
  Headphones,
  Search,
  Store,
  type LucideIcon,
} from "lucide-react";
import { FaqList, type FaqItem } from "@/components/faq/faq-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

type TopicValue = "all" | FaqItem["category"];

interface HelpTopic {
  value: TopicValue;
  label: string;
  heading: string;
  description: string;
  icon: LucideIcon;
}

const HELP_TOPICS: HelpTopic[] = [
  {
    value: "all",
    label: "All topics",
    heading: "All PropertyArk help topics",
    description: "Browse every frequently asked question in one place.",
    icon: CircleHelp,
  },
  {
    value: "getting-started",
    label: "Getting started",
    heading: "Start here",
    description:
      "Learn the basics of finding help, platform trust, and getting around PropertyArk.",
    icon: Compass,
  },
  {
    value: "searching",
    label: "Searching & enquiring",
    heading: "Find and enquire about property",
    description:
      "Search listings by location, review vendors, and make direct enquiries.",
    icon: Search,
  },
  {
    value: "listing",
    label: "Listing your property",
    heading: "List and manage property",
    description:
      "Understand vendor verification, listing requirements, reviews, and publishing.",
    icon: Store,
  },
  {
    value: "bookings",
    label: "Bookings & inspections",
    heading: "Bookings and property inspections",
    description:
      "Get help with inspection requests, shortlet availability, and completed stays.",
    icon: CalendarCheck2,
  },
  {
    value: "payments-accounts",
    label: "Payments & accounts",
    heading: "Payments, portfolios, and accounts",
    description:
      "Find answers about credit points, notifications, purchases, and account activity.",
    icon: CreditCard,
  },
];

export function HelpCenterBrowser({ items }: { items: FaqItem[] }) {
  const [activeTopic, setActiveTopic] = useState<TopicValue>("all");

  const selectedTopic =
    HELP_TOPICS.find((topic) => topic.value === activeTopic) ?? HELP_TOPICS[0];
  const visibleTopics =
    activeTopic === "all"
      ? HELP_TOPICS.filter((topic) => topic.value !== "all")
      : [selectedTopic];

  const getCount = (topic: TopicValue) =>
    topic === "all"
      ? items.length
      : items.filter((item) => item.category === topic).length;

  return (
    <Tabs
      value={activeTopic}
      onValueChange={(value) => setActiveTopic(value as TopicValue)}
      className="w-full min-w-0 flex-col gap-8"
    >
      <div className="w-full min-w-0 overflow-x-auto pb-1">
        <TabsList
          aria-label="Filter Help Center questions by topic"
          className="h-auto w-max min-w-full justify-start gap-1 rounded-xl border bg-card p-2 shadow-sm"
        >
          {HELP_TOPICS.map((topic) => (
            <TabsTrigger
              key={topic.value}
              value={topic.value}
              className="h-10 flex-none gap-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <topic.icon aria-hidden="true" />
              {topic.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="grid w-full min-w-0 items-start gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <Card className="hidden lg:sticky lg:top-28 lg:flex">
          <CardHeader className="border-b">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Browse by topic
            </CardTitle>
            <CardDescription>
              Choose a category to narrow the answers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              value={activeTopic}
              onValueChange={(value) => {
                if (value) setActiveTopic(value as TopicValue);
              }}
              orientation="vertical"
              aria-label="Filter Help Center questions by topic"
              className="flex h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0"
            >
              {HELP_TOPICS.map((topic) => (
                <ToggleGroupItem
                  key={topic.value}
                  value={topic.value}
                  className="h-10 w-full flex-none justify-start gap-2 px-3 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                  <topic.icon aria-hidden="true" />
                  <span className="flex-1 text-left">{topic.label}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {getCount(topic.value)}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardContent>
          <CardFooter className="flex-col items-start gap-3">
            <div className="flex items-center gap-2 font-medium">
              <Headphones aria-hidden="true" className="size-4" />
              Still stuck?
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Send our support team a message for personal assistance.
            </p>
            <Button variant="link" className="px-0" asChild>
              <Link href="/contact">
                Contact support
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="flex w-full min-w-0 flex-col gap-10">
          {visibleTopics.map((topic, topicIndex) => {
            const topicItems = items.filter(
              (item) => item.category === topic.value,
            );

            return (
              <section
                key={topic.value}
                aria-labelledby={`${topic.value}-heading`}
                className="flex flex-col gap-5"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {String(topicIndex + 1).padStart(2, "0")} — {topic.label}
                  </p>
                  <h2
                    id={`${topic.value}-heading`}
                    className="mt-2 text-2xl font-semibold sm:text-3xl"
                  >
                    {topic.heading}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    {topic.description}
                  </p>
                </div>
                <FaqList
                  key={`${activeTopic}-${topic.value}`}
                  items={topicItems}
                  openFirst={activeTopic !== "all"}
                />
              </section>
            );
          })}
        </div>
      </div>
    </Tabs>
  );
}
