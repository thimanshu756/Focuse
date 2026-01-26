import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import config, { API_TIMEOUT } from '@/constants/config';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: config.apiUrl,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (__DEV__) {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
          if (config.data) console.log('[API] Data:', JSON.stringify(config.data, null, 2));
        }

        return config;
      },
      (error: AxiosError) => {
        if (__DEV__) {
          console.error('[API] Request Error:', error.message);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors and token refresh
    this.api.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log(`[API] ${response.status} ${response.config.url}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (__DEV__) {
          console.error(
            `[API] Error ${error.response?.status} ${error.config?.url}:`,
            error.message
          );
          if (error.response?.data) {
            console.log('[API] Error Data:', error.response.data);
          }
        }

        // Handle 401 Unauthorized - Try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (refreshToken) {
              const { data } = await axios.post(
                `${config.apiUrl}/auth/refresh`,
                {
                  refreshToken,
                }
              );

              const { accessToken } = data.data;
              await SecureStore.setItemAsync('accessToken', accessToken);

              // Retry original request
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - Clear tokens and redirect to login
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            // TODO: Trigger logout/navigation to login
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public getAxiosInstance(): AxiosInstance {
    console.log('API URL:', config.apiUrl);
    console.log('API Instance:', this.api);
    return this.api;
  }
}

export const apiService = new ApiService();
export const api = apiService.getAxiosInstance();
