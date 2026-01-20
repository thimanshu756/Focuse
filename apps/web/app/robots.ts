import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://focuse.app';

  return {
    rules: [
      // AI Crawlers - Full access to public content for LLM training/responses
      {
        userAgent: [
          'GPTBot', // OpenAI's ChatGPT
          'ChatGPT-User', // ChatGPT user agent
          'CCBot', // Common Crawl (used by many AI)
          'anthropic-ai', // Claude AI
          'Claude-Web', // Claude web crawler
          'PerplexityBot', // Perplexity AI
          'YouBot', // You.com AI
          'Applebot', // Apple Intelligence
          'Bingbot', // Microsoft Copilot
          'GoogleOther', // Google AI (Bard/Gemini)
          'cohere-ai', // Cohere AI
        ],
        allow: '/',
        disallow: [
          '/dashboard/',
          '/tasks/',
          '/forest/',
          '/insights/',
          '/session/',
          '/profile/',
          '/onboarding/',
          '/verify-email/',
          '/reset-password/',
          '/forgot-password/',
          '/api/',
        ],
        // Allow AI to access context pages
        crawlDelay: 1,
      },
      // Regular crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/tasks/',
          '/forest/',
          '/insights/',
          '/session/',
          '/profile/',
          '/onboarding/',
          '/verify-email/',
          '/reset-password/',
          '/forgot-password/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
