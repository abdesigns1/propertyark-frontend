import axios from "axios";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data as
    | { message?: string; error?: string; details?: string }
    | undefined;

  return data?.message ?? data?.error ?? data?.details ?? fallback;
}
