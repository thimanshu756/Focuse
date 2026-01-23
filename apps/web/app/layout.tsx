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
  title: {
    default: 'Focuse - AI-Powered Focus Timer & Productivity App',
    template: '%s | Focuse',
  },
  description:
    'Focuse is your AI-powered focus companion that helps you stay productive. Turn goals into progress, minutes into momentum with Pomodoro timer, task management, and AI insights.',
  keywords: [
    'focus timer',
    'pomodoro timer',
    'productivity app',
    'AI task management',
    'time management',
    'focus app',
    'productivity tracker',
    'Chitra AI',
    'task breakdown',
    'focus sessions',
  ],
  authors: [{ name: 'Focuse' }],
  creator: 'Focuse',
  publisher: 'Focuse',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://focuse.rakriai.com'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Focuse - AI-Powered Focus Timer & Productivity App',
    description:
      'Stay focused and productive with AI-powered task management. Turn your goals into progress with intelligent Pomodoro timer and insights.',
    siteName: 'Focuse',
    images: [
      {
        url: '/assets/logo.png',
        width: 1200,
        height: 1200,
        alt: 'Focuse - AI-Powered Focus Timer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Focuse - AI-Powered Focus Timer & Productivity App',
    description:
      'Stay focused and productive with AI-powered task management. Turn your goals into progress.',
    images: ['/assets/logo.png'],
    creator: '@focuseapp',
  },
  icons: {
    icon: [
      {
        url: '/assets/favicon_io/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/assets/favicon_io/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      { url: '/assets/favicon_io/favicon.ico', sizes: 'any' },
    ],
    apple: [
      {
        url: '/assets/favicon_io/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/assets/favicon_io/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/assets/favicon_io/android-chrome-512x512.png',
      },
    ],
  },
  manifest: '/assets/favicon_io/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
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
