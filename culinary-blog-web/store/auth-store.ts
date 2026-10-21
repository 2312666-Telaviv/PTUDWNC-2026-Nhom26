import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { User } from '@/types/user';

/**
 * Auth store - quản lý trạng thái đăng nhập của người dùng (Lab 6 - Phần 3).
 *
 * - Dùng Zustand + middleware `persist` để giữ phiên đăng nhập trên localStorage.
 * - Chỉ lưu `user`, `accessToken`, `isAuthenticated`; các trạng thái tạm
 *   (`isLoading`, `error`) không lưu xuống storage.
 * - An toàn khi chạy SSR: không truy cập `window` trực tiếp ở cấp module.
 */
export interface AuthState {
  /** Người dùng hiện tại, null khi chưa đăng nhập */
  user: User | null;
  /** JWT access token, null khi chưa đăng nhập */
  accessToken: string | null;
  /** Đã đăng nhập hay chưa */
  isAuthenticated: boolean;
  /** Đang trong lúc gọi API (đăng nhập/đăng ký/đăng xuất) */
  isLoading: boolean;
  /** Thông báo lỗi gần nhất, null khi không có lỗi */
  error: string | null;

  /** Đăng nhập thành công: lưu user + token */
  setAuth: (user: User, token: string) => void;
  /** Cập nhật thông tin người dùng (ví dụ sau khi sửa profile) */
  setUser: (user: User) => void;
  /** Đăng xuất: xoá toàn bộ thông tin phiên */
  logout: () => void;
  /** Bật/tắt trạng thái loading */
  setLoading: (isLoading: boolean) => void;
  /** Ghi lỗi (truyền null để xoá lỗi) */
  setError: (error: string | null) => void;
  /** Xoá lỗi */
  clearError: () => void;
}

/**
 * Storage giả: dùng khi chạy SSR (không có window) hoặc trình duyệt chặn
 * localStorage (chế độ riêng tư). Không bao giờ để lỗi xảy ra lúc khởi tạo store.
 */
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

/** Lấy storage an toàn cho cả server lẫn client */
function getStorage(): StateStorage {
  // SSR: server không có window.localStorage -> dùng storage giả
  if (typeof window === 'undefined') {
    return noopStorage;
  }

  try {
    return window.localStorage;
  } catch {
    // Một số trình duyệt chặn truy cập localStorage -> dùng storage giả
    return noopStorage;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // TODO: sau khi có API thật, nơi gọi API sẽ gọi setAuth(user, token) sau khi
      // POST /api/v1/auth/login thành công (lớp API của thành viên phụ trách phần 1 & 2).
      setAuth: (user, token) =>
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
          error: null,
        }),

      setUser: (user) => set({ user }),

      // TODO: nếu backend hỗ trợ đăng xuất phía server thì gọi API trước khi xoá state.
      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          error: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'culinary-blog-auth-v1',
      version: 1,
      storage: createJSONStorage(getStorage),
      // Chỉ lưu phần phiên đăng nhập, không lưu isLoading/error (trạng thái tạm)
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // Bật skipHydration để không lệch dữ liệu giữa render SSR và render phía client.
      // Store được rehydrate thủ công trong useEffect (xem components/auth/AuthStoreHydration.tsx).
      skipHydration: true,
    }
  )
);

/* ---------- Selector gọn: useAuthStore(selectUser) ---------- */
export const selectUser = (state: AuthState) => state.user;
export const selectAccessToken = (state: AuthState) => state.accessToken;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;

/* ---------- Hook tiện lợi ---------- */
export function useAuthUser(): User | null {
  return useAuthStore(selectUser);
}

export function useIsAuthenticated(): boolean {
  return useAuthStore(selectIsAuthenticated);
}
