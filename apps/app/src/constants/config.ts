import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':')[0] || 'localhost';

const ENV = {
  dev: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || `http://${localhost}:8080/api`,
  },
  staging: {
    apiUrl: 'https://staging-api.forest.app/api',
  },
  prod: {
    apiUrl: 'https://api.forest.app/api',
  },
};

const getEnvVars = () => {
  const env = Constants.expoConfig?.extra?.EXPO_PUBLIC_ENV || 'dev';

  if (env === 'prod') return ENV.prod;
  if (env === 'staging') return ENV.staging;
  return ENV.dev;
};

export default getEnvVars();

export const API_TIMEOUT = 10000;
export const APP_NAME = 'Forest Focus';
export const APP_VERSION = '1.0.0';
