import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 120000, // 120 seconds (2 minutes) - increased for AI operations
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * API client specifically for AI operations with extended timeout
 * Use this for requests that may take longer (e.g., AI task breakdown, AI insights)
 */
export const aiApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 150000, // 150 seconds (2.5 minutes) - extra buffer for AI operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Shared request interceptor - add auth token
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
};

// Shared response interceptor - handle errors and token refresh
const createResponseInterceptor = (client: typeof api | typeof aiApi) => {
  return async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const { data } = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
              { refreshToken }
            );

            if (data.success && data.data) {
              localStorage.setItem('accessToken', data.data.accessToken);
              localStorage.setItem('refreshToken', data.data.refreshToken);

              // Retry original request
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
              }
              return client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            if (window.location.pathname !== '/signup') {
              window.location.href = '/login';
            }
          }
        } else {
          // No refresh token, redirect to login
          localStorage.removeItem('accessToken');
          if (window.location.pathname !== '/signup') {
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  };
};

// Apply interceptors to default API client
api.interceptors.request.use(requestInterceptor, (error) =>
  Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  createResponseInterceptor(api)
);

// Apply interceptors to AI API client
aiApi.interceptors.request.use(requestInterceptor, (error) =>
  Promise.reject(error)
);
aiApi.interceptors.response.use(
  (response) => response,
  createResponseInterceptor(aiApi)
);

export default api;
