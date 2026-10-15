import { Footer } from "@/components/shared/footer";
import { PageBanner } from "@/components/shared/page-banner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { MailWarning } from "lucide-react";
import { NewsletterUnsubscribeForm } from "@/features/newsletter/components/newsletter-unsubscribe-form";
import { cn, CONTAINER } from "@/lib/utils";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Unsubscribe from Newsletter",
  description: "Manage your PropertyArk newsletter subscription.",
  path: "/newsletter/unsubscribe",
});

export default async function NewsletterUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token: tokenValue } = await searchParams;
  const token = Array.isArray(tokenValue) ? tokenValue[0] : tokenValue;

  return (
    <>
      <PageBanner
        title="Newsletter Preferences"
        description="Manage the property updates you receive from PropertyArk."
        imageSrc="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600"
        imageAlt="Modern office buildings"
      />
      <section className={cn(CONTAINER, "py-20")}>
        {token ? (
          <NewsletterUnsubscribeForm token={token} />
        ) : (
          <Empty className="mx-auto min-h-80 max-w-xl border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MailWarning />
              </EmptyMedia>
              <EmptyTitle>Unsubscribe link is incomplete</EmptyTitle>
              <EmptyDescription>
                Please use the unsubscribe link included in a PropertyArk
                newsletter email.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
      <Footer />
    </>
  );
}
