import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':')[0] || 'localhost';

console.log('[CONFIG] DebuggerHost:', debuggerHost);
console.log('[CONFIG] Localhost:', localhost);

const ENV = {
  dev: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || `http://${localhost}:8080/api`,
    webUrl: process.env.EXPO_PUBLIC_WEB_URL || `http://${localhost}:3000`,
  },
  staging: {
    apiUrl: 'https://calm-angelita-focuse-67b74fb8.koyeb.app/api',
    webUrl: 'https://focuse.rakriai.com/',
  },
  prod: {
    apiUrl: 'https://calm-angelita-focuse-67b74fb8.koyeb.app/api',
    webUrl: 'https://focuse.rakriai.com',
  },
};

const getEnvVars = () => {
  const env =
    process.env.EXPO_PUBLIC_ENVIRONMENT ||
    Constants.expoConfig?.extra?.environment ||
    'dev';

  console.log('[CONFIG] Environment:', env);

  if (env === 'production' || env === 'prod') return ENV.prod;
  if (env === 'staging') return ENV.staging;
  return ENV.dev;
};

const config = getEnvVars();
console.log('[CONFIG] Final API URL:', config.apiUrl);
console.log('[CONFIG] Final Web URL:', config.webUrl);

export default config;

export const API_TIMEOUT = 10000;
export const APP_NAME = 'FOCUSE';
export const APP_VERSION = '1.0.0';
export const DEEP_LINK_SCHEME = 'forest://';
