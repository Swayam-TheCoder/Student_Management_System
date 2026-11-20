import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, getActiveBaseUrl } from '../utils/env';
import { secureStorage } from '../utils/secureStorage';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

// Request Interceptor: Attach Bearer Token & Dynamic Base URL
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Resolve dynamic Base URL
    const activeUrl = await getActiveBaseUrl();
    config.baseURL = activeUrl;

    const token = await secureStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global 401 & Server Error Messages
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; validationErrors?: Record<string, string> }>) => {
    if (error.response?.status === 401) {
      await secureStorage.removeToken();
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);
