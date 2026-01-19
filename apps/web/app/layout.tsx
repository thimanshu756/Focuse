import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/lib/toast';
import { GoogleAuthProvider } from '@/lib/google-oauth-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Forest - Focus Timer',
  description: 'Stay focused and grow your tree',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <GoogleAuthProvider>
          {children}
          <ToastProvider />
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
