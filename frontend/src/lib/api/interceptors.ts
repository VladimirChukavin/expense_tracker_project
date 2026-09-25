import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import apiClient from './client';

interface AuthTokens {
  access: string;
  refresh: string;
}

const TOKEN_KEY = 'auth_tokens';

export const getTokens = (): AuthTokens | null => {
  try {
    const tokens = localStorage.getItem(TOKEN_KEY);
    return tokens ? JSON.parse(tokens) : null;
  } catch {
    // битые данные в localStorage не должны ломать приложение
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
};

export const setTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string | null) => void) => {
  refreshSubscribers.push(cb);
};

const notifySubscribers = (token: string | null) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = getTokens();

    if (tokens?.access && config.headers) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string | null) => {
            if (!token) {
              reject(error);
              return;
            }
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const tokens = getTokens();

      if (!tokens?.refresh) {
        isRefreshing = false;
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // отдельный axios-вызов: без interceptors, иначе рекурсия
        const { default: axios } = await import('axios');
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/auth/token/refresh/`,
          { refresh: tokens.refresh }
        );

        const { access } = response.data;
        setTokens({ ...tokens, access });

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        isRefreshing = false;
        notifySubscribers(access);

        return apiClient(originalRequest);
      } catch (refreshError) {
        // сообщаем ожидающим запросам, что refresh не удался
        isRefreshing = false;
        notifySubscribers(null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
