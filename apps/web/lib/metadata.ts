import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://focuse.rakriai.com';

export const pageMetadata = {
  login: {
    title: 'Login',
    description:
      'Sign in to your Focuse account and start your productive journey. Access your tasks, focus sessions, and AI-powered insights.',
    openGraph: {
      title: 'Login to Focuse - AI-Powered Focus Timer',
      description:
        'Sign in to access your personalized productivity dashboard.',
      url: `${baseUrl}/login`,
    },
    twitter: {
      title: 'Login to Focuse',
      description:
        'Sign in to access your personalized productivity dashboard.',
    },
    alternates: {
      canonical: '/login',
    },
  } as Metadata,

  signup: {
    title: 'Sign Up',
    description:
      'Create your free Focuse account and unlock AI-powered productivity. Start building your focus forest today with Chitra AI assistance.',
    openGraph: {
      title: 'Sign Up for Focuse - Start Free Today',
      description:
        'Join thousands of productive users. Create your free account and start focusing better.',
      url: `${baseUrl}/signup`,
    },
    twitter: {
      title: 'Sign Up for Focuse',
      description:
        'Join thousands of productive users. Start focusing better today.',
    },
    alternates: {
      canonical: '/signup',
    },
  } as Metadata,

  pricing: {
    title: 'Pricing',
    description:
      'Choose the perfect Focuse plan for your productivity needs. Start free or upgrade to Pro for unlimited focus sessions, advanced AI insights, and priority support.',
    keywords: [
      'focuse pricing',
      'productivity app pricing',
      'pomodoro timer pro',
      'focus timer plans',
      'AI productivity subscription',
    ],
    openGraph: {
      title: 'Focuse Pricing - Free & Pro Plans',
      description:
        'Start free or upgrade to Pro for unlimited sessions and advanced AI features.',
      url: `${baseUrl}/pricing`,
    },
    twitter: {
      title: 'Focuse Pricing Plans',
      description: 'Start free or upgrade to Pro for unlimited sessions.',
    },
    alternates: {
      canonical: '/pricing',
    },
  } as Metadata,

  dashboard: {
    title: 'Dashboard',
    description:
      'Your Focuse dashboard - track your productivity, view focus statistics, and access quick actions for your daily tasks.',
    openGraph: {
      title: 'Dashboard - Focuse',
      description: 'Your personal productivity command center.',
      url: `${baseUrl}/dashboard`,
    },
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: '/dashboard',
    },
  } as Metadata,

  tasks: {
    title: 'Tasks',
    description:
      'Manage your tasks with AI assistance. Break down complex projects, prioritize effectively, and get intelligent suggestions from Chitra AI.',
    openGraph: {
      title: 'Task Management - Focuse',
      description: 'AI-powered task management and breakdown.',
      url: `${baseUrl}/tasks`,
    },
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: '/tasks',
    },
  } as Metadata,

  forest: {
    title: 'Forest',
    description:
      'Your focus forest - visualize your productivity journey. Every completed session grows your forest. Track your growth and celebrate milestones.',
    openGraph: {
      title: 'My Focus Forest - Focuse',
      description:
        'Visualize your productivity journey with your growing forest.',
      url: `${baseUrl}/forest`,
    },
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: '/forest',
    },
  } as Metadata,

  insights: {
    title: 'Insights',
    description:
      'AI-powered productivity insights. Discover your focus patterns, peak performance times, and get personalized recommendations from Chitra AI.',
    openGraph: {
      title: 'Productivity Insights - Focuse',
      description: 'AI-powered analytics for better focus and productivity.',
      url: `${baseUrl}/insights`,
    },
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: '/insights',
    },
  } as Metadata,

  session: {
    title: 'Focus Session',
    description:
      'Active focus session - stay in the zone with your Pomodoro timer. Watch your tree grow as you maintain focus.',
    openGraph: {
      title: 'Focus Session - Focuse',
      description: 'Stay focused and grow your tree.',
      url: `${baseUrl}/session`,
    },
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: '/session',
    },
  } as Metadata,

  profile: {
    title: 'Profile',
    description:
      'Manage your Focuse profile, preferences, and account settings.',
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: '/profile',
    },
  } as Metadata,

  verifyEmail: {
    title: 'Verify Email',
    description: 'Verify your email address to activate your Focuse account.',
    robots: {
      index: false,
      follow: false,
    },
  } as Metadata,

  forgotPassword: {
    title: 'Forgot Password',
    description:
      'Reset your Focuse password. Enter your email to receive password reset instructions.',
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: '/forgot-password',
    },
  } as Metadata,

  resetPassword: {
    title: 'Reset Password',
    description: 'Create a new password for your Focuse account.',
    robots: {
      index: false,
      follow: false,
    },
  } as Metadata,

  onboarding: {
    title: 'Welcome to Focuse',
    description:
      'Complete your Focuse onboarding and start your productivity journey.',
    robots: {
      index: false,
      follow: false,
    },
  } as Metadata,

  privacy: {
    title: 'Privacy Policy',
    description:
      'Learn how Focuse collects, uses, and protects your personal information. Our commitment to your privacy and data security.',
    keywords: [
      'focuse privacy policy',
      'data protection',
      'user privacy',
      'GDPR compliance',
      'data security',
    ],
    openGraph: {
      title: 'Privacy Policy - Focuse',
      description:
        'Our commitment to protecting your privacy and personal data.',
      url: `${baseUrl}/privacy`,
    },
    twitter: {
      title: 'Privacy Policy - Focuse',
      description: 'Our commitment to protecting your privacy and data.',
    },
    alternates: {
      canonical: '/privacy',
    },
  } as Metadata,

  terms: {
    title: 'Terms of Service',
    description:
      'Terms and conditions for using Focuse. Understand your rights and responsibilities when using our AI-powered focus timer and productivity platform.',
    keywords: [
      'focuse terms of service',
      'terms and conditions',
      'user agreement',
      'service terms',
      'legal terms',
    ],
    openGraph: {
      title: 'Terms of Service - Focuse',
      description: 'Terms and conditions for using our platform.',
      url: `${baseUrl}/terms`,
    },
    twitter: {
      title: 'Terms of Service - Focuse',
      description: 'Terms and conditions for using Focuse.',
    },
    alternates: {
      canonical: '/terms',
    },
  } as Metadata,
};
