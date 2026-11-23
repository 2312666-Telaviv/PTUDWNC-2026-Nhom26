import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5041';
const normalizedBaseUrl = rawBaseUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
const baseURL = `${normalizedBaseUrl}/api/v1`;

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const authStoreRaw = window.localStorage.getItem('culinary-blog-auth-v1');
    if (authStoreRaw) {
      const authStore = JSON.parse(authStoreRaw) as {
        state?: { accessToken?: string | null };
      };
      if (authStore.state?.accessToken) return authStore.state.accessToken;
    }

    const legacyRaw = window.localStorage.getItem('auth-storage');
    if (!legacyRaw) return null;
    const legacy = JSON.parse(legacyRaw) as { state?: { token?: string | null } };
    return legacy.state?.token ?? null;
  } catch {
    return null;
  }
}

async function applyAuth(config: InternalAxiosRequestConfig) {
  if (typeof window !== 'undefined') {
    let token = getStoredToken();

    if (!token) {
      try {
        const session = await getSession();
        token = session?.user?.accessToken ?? null;
      } catch {
        token = null;
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
  }

  return config;
}

function redirectOnUnauthorized(error: AxiosError) {
  const originalRequest = error.config as RetryableRequestConfig | undefined;
  const url = originalRequest?.url ?? '';
  const isAuthEndpoint =
    url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/logout');

  if (!isAuthEndpoint && error.response?.status === 401 && originalRequest && !originalRequest._retry) {
    originalRequest._retry = true;
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return Promise.reject(error);
}

const sharedConfig = {
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const axiosInstance = axios.create(sharedConfig);

axiosInstance.interceptors.request.use(async (config) => {
  if (typeof config.url === 'string' && config.url.startsWith('/api/v1/')) {
    config.url = config.url.slice('/api/v1'.length);
  }
  return applyAuth(config);
});

axiosInstance.interceptors.response.use((response) => response, redirectOnUnauthorized);

const apiClient = axios.create(sharedConfig);

apiClient.interceptors.request.use(applyAuth);
apiClient.interceptors.response.use((response) => response, redirectOnUnauthorized);

export default apiClient;
