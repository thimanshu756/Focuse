import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import config, { API_TIMEOUT } from '@/constants/config';

class ApiService {
  private api: AxiosInstance;
  private aiApi: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: config.apiUrl,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.aiApi = axios.create({
      baseURL: config.apiUrl,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private async addAuthHeader(config: InternalAxiosRequestConfig) {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    const requestInterceptor = async (config: InternalAxiosRequestConfig) => {
      await this.addAuthHeader(config);

      if (__DEV__) {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        if (config.data) console.log('[API] Data:', JSON.stringify(config.data, null, 2));
      }

      return config;
    };

    const requestErrorHandler = (error: AxiosError) => {
      if (__DEV__) {
        console.error('[API] Request Error:', error.message);
      }
      return Promise.reject(error);
    };

    // Apply to both instances
    this.api.interceptors.request.use(requestInterceptor, requestErrorHandler);
    this.aiApi.interceptors.request.use(requestInterceptor, requestErrorHandler);

    // Response interceptor - Handle errors and token refresh
    const responseInterceptor = async (error: AxiosError) => {
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

            if (data.success && data.data) {
              await SecureStore.setItemAsync('accessToken', data.data.accessToken);
              await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);

              // Retry original request
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
              }
              return this.api(originalRequest);
            }
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
    };

    this.api.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log(`[API] ${response.status} ${response.config.url}`);
        }
        return response;
      },
      responseInterceptor
    );

    this.aiApi.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log(`[AI API] ${response.status} ${response.config.url}`);
        }
        return response;
      },
      responseInterceptor
    );
  }

  public getAxiosInstance(): AxiosInstance {
    console.log('API URL:', config.apiUrl);
    console.log('API Instance:', this.api);
    return this.api;
  }

  public getAiAxiosInstance(): AxiosInstance {
    return this.aiApi;
  }
}

export const apiService = new ApiService();
export const api = apiService.getAxiosInstance();
export const aiApi = apiService.getAiAxiosInstance();