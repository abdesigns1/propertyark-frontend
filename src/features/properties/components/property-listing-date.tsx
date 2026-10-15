"use client";

import { useEffect, useState } from "react";

const ONE_DAY_MS = 24 * 60 * 60 * 1_000;

function exactListingDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(timestamp);
}

function relativeListingDate(timestamp: number, now: number) {
  const elapsed = Math.max(0, now - timestamp);
  if (elapsed < 60_000) return "just now";

  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

export function PropertyListingDate({ date }: { date?: string | null }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!date) return <span>Not available</span>;
  const timestamp = new Date(date).getTime();
  if (!Number.isFinite(timestamp)) return <span>Not available</span>;

  const label =
    now - timestamp < ONE_DAY_MS
      ? relativeListingDate(timestamp, now)
      : exactListingDate(timestamp);

  return (
    <time
      dateTime={date}
      title={exactListingDate(timestamp)}
      suppressHydrationWarning
    >
      {label}
    </time>
  );
}
