import { MessagingPage } from "@/features/messages/components/messaging-page";

export default async function BuyerMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    session?: string | string[];
    property?: string | string[];
    propertyTitle?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const session = params.session;
  const property = params.property;
  const propertyTitle = params.propertyTitle;
  return (
    <MessagingPage
      role="buyer"
      initialSessionId={Array.isArray(session) ? session[0] : session}
      initialPropertyId={Array.isArray(property) ? property[0] : property}
      initialPropertyTitle={
        Array.isArray(propertyTitle) ? propertyTitle[0] : propertyTitle
      }
    />
  );
}
