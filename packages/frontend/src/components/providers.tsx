'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { unstableSetRender } from 'antd-mobile';
import { createRoot } from 'react-dom/client';
import { queryClient } from '@/lib/query-client';

unstableSetRender((node, container) => {
  (container as any)._reactRoot ||= createRoot(container);
  const root = (container as any)._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <App notification={{ placement: 'top', duration: 4 }}>
        {children}
      </App>
    </QueryClientProvider>
  );
}
