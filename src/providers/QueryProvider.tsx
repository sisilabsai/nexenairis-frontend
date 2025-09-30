'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Retry failed requests 3 times
            retry: 3,
            
            // Retry delay increases exponentially
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            
            // Stale time - data is considered fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            
            // Cache time - data stays in cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            
            // Refetch on window focus
            refetchOnWindowFocus: false,
            
            // Refetch on reconnect
            refetchOnReconnect: true,
            
            // Refetch on mount
            refetchOnMount: true,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
            
            // Retry delay for mutations
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
















