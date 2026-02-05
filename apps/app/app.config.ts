import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'FOCUSE',
  slug: 'forest-focus',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  scheme: 'forest',
  splash: {
    resizeMode: 'contain',
    backgroundColor: '#EAF2FF',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.forest.focus',
    buildNumber: '1.0.0',
  },
  android: {
    package: 'com.forest.focus',
    versionCode: 1,
  },
  web: {
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    [
      'expo-updates',
      {
        username: process.env.EXPO_PUBLIC_EAS_USERNAME || 'your-username',
      },
    ],
    [
      'expo-notifications',
      {
        color: '#D7F50A',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || '21ba0cf7-a6b9-41d2-8828-ad8e1dbb0dc4',
    },
    // Environment configuration
    environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
    apiUrl: process.env.EXPO_PUBLIC_API_URL,

    // Observability
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    postHogApiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
    postHogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST,
  },
});
