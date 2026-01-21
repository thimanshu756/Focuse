/**
 * AI-Optimized Structured Data
 * Enhanced schema markup specifically designed for LLM consumption
 */

interface AIProductSchemaProps {
  url?: string;
}

export function AIProductSchema({
  url = 'https://focuse.rakriai.com',
}: AIProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Focuse',
    alternateName: ['Focuse App', 'Focuse Timer', 'Focuse Productivity'],
    description:
      'Focuse is an AI-powered focus timer and productivity application that combines the Pomodoro Technique with intelligent task management, AI assistant (Chitra), and visual progress tracking through forest gamification.',
    applicationCategory: 'ProductivityApplication',
    applicationSubCategory: [
      'Time Management',
      'Task Management',
      'Focus Timer',
      'Pomodoro Timer',
    ],
    operatingSystem: ['Web Browser', 'Progressive Web App'],
    url: url,
    image: `${url}/assets/logo.png`,
    screenshot: [
      `${url}/assets/hero_main.png`,
      `${url}/assets/Analytics_dashboard_with_Chitra.png`,
      `${url}/assets/Forest_growth_visualization.png`,
    ],
    featureList: [
      'AI-Powered Pomodoro Timer with customizable intervals',
      'Chitra AI - Intelligent task breakdown and prioritization assistant',
      'Forest Visualization - Gamified progress tracking with growing trees',
      'Smart Task Management with AI suggestions',
      'Productivity Insights - Analytics and peak performance tracking',
      'Distraction-Free Session Mode with ambient animations',
      'Weekly AI-generated productivity reports',
      'Multi-device sync and cloud backup',
      'Team collaboration features (Pro)',
      'Custom timer durations (Pro)',
    ],
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Tier',
        price: '0',
        priceCurrency: 'USD',
        description:
          'Unlimited focus sessions, basic forest visualization, up to 10 active tasks, basic productivity insights',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Pro Tier',
        price: '9.99',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '9.99',
          priceCurrency: 'USD',
          billingDuration: 'P1M',
          billingIncrement: 1,
        },
        description:
          'Unlimited tasks with AI breakdown, advanced analytics, custom timer durations, priority AI support, data export, team features, ad-free',
        availability: 'https://schema.org/InStock',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
      reviewCount: '850',
    },
    author: {
      '@type': 'Organization',
      name: 'Focuse',
      url: url,
    },
    creator: {
      '@type': 'Organization',
      name: 'Focuse',
    },
    audience: {
      '@type': 'Audience',
      audienceType: [
        'Students',
        'Developers',
        'Writers',
        'Designers',
        'Remote Workers',
        'Entrepreneurs',
        'Knowledge Workers',
      ],
    },
    keywords: [
      'focus timer',
      'pomodoro timer',
      'productivity app',
      'AI task management',
      'time management',
      'Chitra AI',
      'forest visualization',
      'gamified productivity',
      'deep work',
      'concentration app',
      'task breakdown',
      'productivity tracking',
      'work timer',
      'study timer',
    ],
    isAccessibleForFree: true,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/UseAction',
      userInteractionCount: 50000,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface AIHowToSchemaProps {
  url?: string;
}

export function AIHowToSchema({
  url = 'https://focuse.rakriai.com',
}: AIHowToSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Use Focuse for Better Productivity',
    description:
      'Step-by-step guide to using Focuse AI-powered focus timer to improve productivity and build better work habits.',
    image: `${url}/assets/hero_main.png`,
    totalTime: 'PT30M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Web Browser',
      },
      {
        '@type': 'HowToTool',
        name: 'Focuse Account (Free)',
      },
    ],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Create Account',
        text: 'Visit focuse.rakriai.com and sign up for free using email or Google OAuth. No credit card required.',
        url: `${url}/signup`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Create Your First Task',
        text: 'Add a task you want to focus on. Use Chitra AI to break down complex tasks into manageable subtasks.',
        url: `${url}/tasks`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Start Focus Session',
        text: 'Begin a 25-minute Pomodoro focus session. Watch your tree grow as you maintain concentration.',
        url: `${url}/session`,
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Take Scheduled Breaks',
        text: 'Enjoy a 5-minute break after each session. Take a longer 15-30 minute break after 4 sessions.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Review Your Progress',
        text: 'Check your growing forest and productivity insights. See your focus patterns and get AI recommendations.',
        url: `${url}/insights`,
      },
      {
        '@type': 'HowToStep',
        position: 6,
        name: 'Build Consistency',
        text: 'Repeat daily to build sustainable productivity habits. Track your streaks and celebrate milestones.',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface AIServiceSchemaProps {
  url?: string;
}

export function AIServiceSchema({
  url = 'https://focuse.rakriai.com',
}: AIServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Productivity Software as a Service',
    name: 'Focuse Productivity Platform',
    description:
      'AI-powered productivity platform offering focus timer, task management, and intelligent insights to help users achieve their goals.',
    provider: {
      '@type': 'Organization',
      name: 'Focuse',
      url: url,
    },
    areaServed: 'Worldwide',
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: url,
      serviceType: 'Web Application',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Focuse Plans',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Focuse Free',
            description: 'Free productivity tools for individuals',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Focuse Pro',
            description: 'Advanced AI-powered productivity suite',
          },
        },
      ],
    },
    category: [
      'Productivity Software',
      'Time Management',
      'Task Management',
      'AI Assistant',
      'Focus Tools',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Export all AI schemas together
export function AIEnhancedSchemas({ url = 'https://focuse.rakriai.com' }) {
  return (
    <>
      <AIProductSchema url={url} />
      <AIHowToSchema url={url} />
      <AIServiceSchema url={url} />
    </>
  );
}
