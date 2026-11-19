import axios from 'axios';

// Base URL trỏ tới .NET API.
// .env.local thường khai báo ...:5001/api trong khi các service dùng đường dẫn
// /api/v1/... nên ta chuẩn hóa lại để tránh bị nhân đôi "/api".
const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5041';
const baseURL = rawBaseUrl.replace(/\/api\/?$/, '');

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Đọc JWT từ Zustand persist store (auth-storage) trong localStorage.
 * Dùng chung cho cả luồng xác thực của ứng dụng nên không phụ thuộc next-auth.
 */
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

// Request Interceptor: đính kèm JWT vào header cho mọi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Với FormData, để browser tự sinh boundary cho multipart/form-data
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: xử lý lỗi 401 (hết hạn / chưa đăng nhập)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
