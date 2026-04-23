'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { queryClient } from '@/lib/query-client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <App notification={{ placement: 'top', duration: 4 }}>
        {children}
      </App>
    </QueryClientProvider>
  );
}
