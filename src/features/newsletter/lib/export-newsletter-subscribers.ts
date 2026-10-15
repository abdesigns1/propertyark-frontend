import type { NewsletterSubscriber } from "@/services/newsletter.service";

const FORMULA_PREFIX_PATTERN = /^[=+\-@]/;

function formatCsvCell(value: string) {
  const safeValue = FORMULA_PREFIX_PATTERN.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

function createSubscribersCsv(subscribers: NewsletterSubscriber[]) {
  const rows = [
    ["Name", "Email"],
    ...subscribers.map((subscriber) => [subscriber.name, subscriber.email]),
  ];

  return rows
    .map((row) => row.map((value) => formatCsvCell(value)).join(","))
    .join("\r\n");
}

export function exportNewsletterSubscribers(
  subscribers: NewsletterSubscriber[],
) {
  const csv = createSubscribersCsv(subscribers);
  const file = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8",
  });
  const downloadUrl = URL.createObjectURL(file);
  const downloadLink = document.createElement("a");

  downloadLink.href = downloadUrl;
  downloadLink.download = `propertyark-newsletter-subscribers-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(downloadUrl);
}
