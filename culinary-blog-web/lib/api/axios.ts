import axios from 'axios';
import { getSession } from 'next-auth/react';

// Tạo Axios instance với baseURL trỏ tới .NET API của bạn (chỉnh lại port nếu cần)
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Tự động đính kèm JWT token từ Auth.js Session vào Header
axiosInstance.interceptors.request.use(
  async (config) => {
    // Lấy session hiện tại ở phía client
    const session = await getSession();
    
    // Nếu có token (hoặc accessToken từ backend trả về), gắn vào Authorization Header
    if (session && (session as any).accessToken) {
      config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Xử lý lỗi trả về từ API, đặc biệt là mã 401 (Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu gặp lỗi 401 (Hết hạn token hoặc chưa đăng nhập) và chưa thử lại lần nào
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Có thể thực hiện gọi API refresh token hoặc điều hướng về trang đăng nhập
        // Ở mức cơ bản, chúng ta chuyển hướng user về trang login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);