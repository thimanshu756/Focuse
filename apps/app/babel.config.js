module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Sentry plugin for source maps (production only)
      ...(process.env.NODE_ENV === 'production'
        ? [
            [
              '@sentry/react-native/expo',
              {
                organization: process.env.SENTRY_ORG,
                project: process.env.SENTRY_PROJECT,
              },
            ],
          ]
        : []),
      // Reanimated plugin needs to be listed last
      'react-native-reanimated/plugin',
    ],
  };
};
