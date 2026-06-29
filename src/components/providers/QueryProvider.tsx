"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { useState, ReactNode } from "react";

function mutationErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? "Request failed. Please try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Fallback so a failed mutation always surfaces to the user,
        // even on pages that don't catch mutateAsync rejections.
        mutationCache: new MutationCache({
          onError: (error) => {
            toast.error(mutationErrorMessage(error), { id: "mutation-error" });
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,         // 1 minute
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
