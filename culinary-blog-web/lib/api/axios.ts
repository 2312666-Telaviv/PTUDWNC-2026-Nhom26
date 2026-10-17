import axios from 'axios';
import { getSession } from 'next-auth/react';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      if (typeof window !== 'undefined') {
        const session = await getSession();
        if (session?.user?.accessToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${session.user.accessToken}`;
        }
      }
    } catch (error) {
      // Bỏ qua lỗi lấy session
      console.error('Lỗi khi lấy session:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // Theo yêu cầu: điều hướng cứng về trang đăng nhập khi gặp lỗi 401
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
