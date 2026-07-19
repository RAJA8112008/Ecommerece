/**
 * =============================================================
 * main.jsx — The starting point for the React application
 * =============================================================
 * 
 * In React, everything starts from a single file. This file tells
 * React to attach our app to the <div id="root"> in index.html.
 * 
 * This file wraps our app with several "Providers":
 * 1. BrowserRouter: Enables moving between pages without reloading
 * 2. QueryClientProvider: Manages fetching and caching data from the API
 * 3. AuthProvider: Makes user login data available everywhere
 * =============================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// React Query is used for easy data fetching and caching
const queryClient = new QueryClient({
  defaultOptions: { 
    queries: { 
      retry: 1, 
      staleTime: 5 * 60 * 1000, 
      refetchOnWindowFocus: false 
    } 
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter enables navigating between pages without reloading */}
    <BrowserRouter>
      {/* QueryClientProvider enables useQuery hooks for fetching API data */}
      <QueryClientProvider client={queryClient}>
        {/* AuthProvider wraps the app to share user login state */}
        <AuthProvider>
          
          <App />
          
          {/* Toaster is for those little popup notifications (toast messages) */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'rgba(13, 13, 43, 0.95)',
                color: '#e2e8f0',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                backdropFilter: 'blur(16px)',
                borderRadius: '12px',
                fontSize: '14px',
              },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
