'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#F6F9FF',
          color: '#0F172A',
          borderRadius: '16px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
          border: '1px solid rgba(15, 23, 42, 0.08)',
        },
        success: {
          iconTheme: {
            primary: '#22C55E',
            secondary: '#F6F9FF',
          },
          style: {
            background: '#F0FDF4',
            color: '#166534',
            border: '1px solid #86EFAC',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#F6F9FF',
          },
          style: {
            background: '#FEF2F2',
            color: '#991B1B',
            border: '1px solid #FCA5A5',
          },
        },
        loading: {
          iconTheme: {
            primary: '#D7F50A',
            secondary: '#F6F9FF',
          },
          style: {
            background: '#F6F9FF',
            color: '#0F172A',
            border: '1px solid rgba(215, 245, 10, 0.3)',
          },
        },
      }}
    />
  );
}
