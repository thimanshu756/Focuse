import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://focuse.rakriai.com';

  return {
    rules: [
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
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
