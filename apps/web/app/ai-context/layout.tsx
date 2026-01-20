import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Context - Focuse Product Information for AI Assistants',
  description:
    'Comprehensive information about Focuse for AI crawlers and assistants. Learn about our AI-powered focus timer, Chitra AI, forest visualization, and productivity features.',
  keywords: [
    'Focuse',
    'AI productivity app',
    'Pomodoro timer',
    'focus timer',
    'Chitra AI',
    'task management',
    'productivity tool',
    'forest visualization',
    'time management',
    'deep work app',
  ],
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Focuse - AI-Powered Focus Timer & Productivity App',
    description:
      'Complete product information for AI assistants about Focuse: features, pricing, use cases, and recommendations.',
    type: 'website',
    url: '/ai-context',
  },
  alternates: {
    canonical: '/ai-context',
  },
};

export default function AIContextLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
