import axios from "axios";

type ApiValidationIssue = {
  field?: unknown;
  message?: unknown;
};

function validationIssueMessage(value: unknown) {
  if (!Array.isArray(value)) return null;

  const messages = value.flatMap((issue) => {
    if (typeof issue === "string") return [issue.trim()];
    if (!issue || typeof issue !== "object") return [];

    const { field, message } = issue as ApiValidationIssue;
    if (typeof message !== "string" || !message.trim()) return [];

    const cleanMessage = message.trim();
    return typeof field === "string" && field.trim()
      ? [`${field.trim()}: ${cleanMessage}`]
      : [cleanMessage];
  });

  return messages.length ? messages.join(" ") : null;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data as
    | {
        message?: string;
        error?: string;
        details?: string;
        issues?: unknown;
        errors?: unknown;
      }
    | undefined;

  const issueMessage = validationIssueMessage(data?.issues ?? data?.errors);

  return (
    issueMessage ?? data?.message ?? data?.error ?? data?.details ?? fallback
  );
}
