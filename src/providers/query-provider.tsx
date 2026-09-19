"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useApiWarmup } from "@/hooks/use-api-warmup";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 10 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchIntervalInBackground: false,
          },
          mutations: { retry: 0 },
        },
      }),
  );
  useApiWarmup();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
