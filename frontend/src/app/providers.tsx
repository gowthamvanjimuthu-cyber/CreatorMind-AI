import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Minimal Theme Provider built-in
function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // For MVP forced light or system theme logic could go here
    document.documentElement.classList.add('light'); // default
  }, []);
  return <>{children}</>;
}
