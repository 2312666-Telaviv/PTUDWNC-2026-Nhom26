'use client';

import { signIn, signOut } from 'next-auth/react';
import { authService } from './services';
import { useAuthStore } from '@/store/auth-store';
import { useAuthStore as useLegacyAuthStore } from '@/lib/stores/authStore';
import type { User } from '@/types/user';

/**
 * Đăng nhập thật qua backend .NET:
 * 1. POST /api/v1/auth/login bằng axios để lấy JWT và thông báo lỗi cụ thể.
 * 2. Lưu JWT + user vào Zustand (persist sang localStorage).
 * 3. Tạo phiên NextAuth để các component dùng useSession()/auth() vẫn hoạt động.
 */
export async function loginWithBackend(email: string, password: string): Promise<User> {
  const result = await authService.login({ email: email.trim(), password });
  const fullName = result.fullName?.trim() || '';
  const displayName = fullName || 'Thành viên Culinary Blog';

  const user: User = {
    id: result.userId,
    email: result.email,
    name: displayName,
    fullName,
    avatarUrl: null,
    roles: result.roles ?? [],
    isDefaultPassword: result.isDefaultPassword === true,
  };

  useAuthStore.getState().setAuth(user, result.accessToken);

  useLegacyAuthStore.getState().setUser(
    {
      id: result.userId,
      email: result.email,
      userName: user.name,
      name: user.name,
      fullName,
    },
    result.accessToken
  );

  const sessionResult = await signIn('backend-token', {
    accessToken: result.accessToken,
    userId: result.userId,
    email: result.email,
      name: user.name,
      fullName,
      roles: JSON.stringify(user.roles ?? []),

    isDefaultPassword: user.isDefaultPassword ? 'true' : 'false',
    redirect: false,
  });

  if (sessionResult?.error) {
    throw new Error('Đã đăng nhập nhưng không tạo được phiên web. Vui lòng thử lại.');
  }

  return user;
}

const AUTH_STORAGE_KEYS = ['culinary-blog-auth-v1', 'auth-storage'];

const AUTH_COOKIE_NAMES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'authjs.callback-url',
  '__Secure-authjs.callback-url',
  'authjs.csrf-token',
  '__Secure-authjs.csrf-token',
  'authjs.pkce.code_verifier',
  '__Secure-authjs.pkce.code_verifier',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'next-auth.callback-url',
  '__Secure-next-auth.callback-url',
  'next-auth.csrf-token',
  '__Secure-next-auth.csrf-token',
];

function clearLocalAuthData() {
  if (typeof window === 'undefined') return;

  for (const key of AUTH_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    } catch {
      void 0;
    }
  }

  for (const name of AUTH_COOKIE_NAMES) {
    const secure = name.startsWith('__Secure-') ? '; Secure' : '';
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
  }
}

export interface LogoutOptions {
  redirectTo?: string | null;
}

export async function logoutFromBackend(options: LogoutOptions = {}): Promise<void> {
  const redirectTo = options.redirectTo === undefined ? '/' : options.redirectTo;

  try {
    await authService.logout();
  } catch {
    // JWT stateless: vẫn xóa phiên local dù backend không trả về thành công.
  }

  try {
    await signOut({ redirect: false });
  } catch {
    void 0;
  }

  useAuthStore.getState().logout();
  useLegacyAuthStore.getState().logout();
  clearLocalAuthData();

  if (redirectTo && typeof window !== 'undefined') {
    window.location.assign(redirectTo);
  }
}
