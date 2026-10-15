import Link from "next/link";
import { ArrowRight, Gift, Megaphone } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { activeSiteAnnouncement } from "@/config/site-announcement";
import { CONTAINER, cn } from "@/lib/utils";

const MARQUEE_GROUPS = [0, 1] as const;
const ITEMS_PER_GROUP = [0, 1, 2] as const;

function AnnouncementMessage() {
  return (
    <>
      <strong>{activeSiteAnnouncement.title}</strong>
      <span aria-hidden="true">—</span>
      <span>{activeSiteAnnouncement.message}</span>
      <span>{activeSiteAnnouncement.period}</span>
    </>
  );
}

export function AuthAnnouncementBanner({ className }: { className?: string }) {
  if (!activeSiteAnnouncement.enabled) return null;

  return (
    <Alert
      className={cn(
        "border-secondary/35 bg-secondary/8 px-4 py-3 shadow-sm",
        className,
      )}
    >
      <Gift className="text-secondary" aria-hidden="true" />
      <AlertTitle className="flex flex-wrap items-center gap-2 text-foreground">
        <Badge variant="secondary">{activeSiteAnnouncement.label}</Badge>
        {activeSiteAnnouncement.title}
      </AlertTitle>
      <AlertDescription className="mt-1 leading-relaxed">
        {activeSiteAnnouncement.message} {activeSiteAnnouncement.period}
      </AlertDescription>
    </Alert>
  );
}

export function HomepageAnnouncementMarquee({
  className,
}: {
  className?: string;
}) {
  if (!activeSiteAnnouncement.enabled) return null;

  return (
    <section
      aria-label={activeSiteAnnouncement.label}
      className={cn(
        "border-y border-primary/15 bg-primary text-primary-foreground",
        className,
      )}
    >
      <div
        className={cn(
          CONTAINER,
          "flex min-h-14 items-center gap-3 py-2 sm:gap-5",
        )}
      >
        <Megaphone className="hidden size-5 shrink-0 sm:block" aria-hidden />

        <p className="sr-only">
          {activeSiteAnnouncement.label}. {activeSiteAnnouncement.title}.{" "}
          {activeSiteAnnouncement.message} {activeSiteAnnouncement.period}
        </p>

        <div className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_3rem,black_calc(100%-3rem),transparent)]">
          <div
            aria-hidden="true"
            className="site-announcement-marquee flex w-max items-center"
          >
            {MARQUEE_GROUPS.map((group) => (
              <div key={group} className="flex shrink-0 items-center">
                {ITEMS_PER_GROUP.map((item) => (
                  <div
                    key={item}
                    className="flex shrink-0 items-center gap-2 px-10 text-sm whitespace-nowrap"
                  >
                    <AnnouncementMessage />
                    <span className="ml-4 text-secondary" aria-hidden="true">
                      ●
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <Button
          asChild
          size="sm"
          variant="secondary"
          className="h-9 shrink-0 px-3 shadow-sm sm:px-4"
        >
          <Link href={activeSiteAnnouncement.ctaHref}>
            <span className="hidden sm:inline">
              {activeSiteAnnouncement.ctaLabel}
            </span>
            <span className="sm:hidden">Vendor sign up</span>
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
