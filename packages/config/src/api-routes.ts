/**
 * API route constants
 * @package @forest/config
 */

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    GOOGLE_AUTH: '/api/auth/google',
    APPLE_AUTH: '/api/auth/apple',
  },
  TASKS: {
    LIST: '/api/tasks',
    CREATE: '/api/tasks',
    GET: (id: string) => `/api/tasks/${id}`,
    UPDATE: (id: string) => `/api/tasks/${id}`,
    DELETE: (id: string) => `/api/tasks/${id}`,
  },
  SESSIONS: {
    LIST: '/api/sessions',
    CREATE: '/api/sessions',
    GET: (id: string) => `/api/sessions/${id}`,
    UPDATE: (id: string) => `/api/sessions/${id}`,
    DELETE: (id: string) => `/api/sessions/${id}`,
    FOREST: '/api/sessions/forest',
  },
  SYNC: {
    TASKS: '/api/sync/tasks',
    SESSIONS: '/api/sync/sessions',
  },
  DEVICES: {
    REGISTER: '/api/devices',
    UPDATE: (id: string) => `/api/devices/${id}`,
    DELETE: (id: string) => `/api/devices/${id}`,
  },
  INSIGHTS: {
    DAILY: '/api/insights/daily',
    WEEKLY: '/api/insights/weekly',
    TRENDS: '/api/insights/trends',
  },
  SUBSCRIPTION: {
    PLANS: '/api/subscription/plans',
    CREATE: '/api/subscription/create',
    CANCEL: '/api/subscription/cancel',
    RESUME: '/api/subscription/resume',
    STATUS: '/api/subscription/status',
  },
  HEALTH: '/api/health',
} as const;
