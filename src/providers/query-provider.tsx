"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useApiWarmup } from "@/hooks/use-api-warmup";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  useApiWarmup();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
