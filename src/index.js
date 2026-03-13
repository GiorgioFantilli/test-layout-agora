import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        // Don't retry on 401 or 404
        if (error.message?.includes('401') || error.message?.includes('404')) return false;
        return failureCount < 2;
      },
      staleTime: 5000,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      // If we get a 401 Unauthorized, clear the auth state
      if (error.message?.includes('401') || (error.status === 401)) {
        queryClient.setQueryData(['auth-me'], null);
      }
    },
  }),
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);