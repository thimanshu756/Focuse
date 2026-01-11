import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
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
              return api(originalRequest);
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
  }
);

export default api;
