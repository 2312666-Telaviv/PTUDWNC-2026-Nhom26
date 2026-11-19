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
  const fallbackName = result.email.split('@')[0] || 'Người dùng';

  const user: User = {
    id: result.userId,
    email: result.email,
    name: result.name || fallbackName,
    avatarUrl: null,
    roles: result.roles ?? [],
  };

  useAuthStore.getState().setAuth(user, result.accessToken);

  useLegacyAuthStore.getState().setUser(
    {
      id: result.userId,
      email: result.email,
      userName: user.name,
      name: user.name,
    },
    result.accessToken
  );

  const sessionResult = await signIn('backend-token', {
    accessToken: result.accessToken,
    userId: result.userId,
    email: result.email,
    name: user.name,
    roles: JSON.stringify(user.roles ?? []),
    redirect: false,
  });

  if (sessionResult?.error) {
    throw new Error('Đã đăng nhập nhưng không tạo được phiên web. Vui lòng thử lại.');
  }

  return user;
}

export async function logoutFromBackend(): Promise<void> {
  try {
    await authService.logout();
  } catch {
    // JWT stateless: vẫn xóa phiên local dù backend không trả về thành công.
  }

  useAuthStore.getState().logout();
  useLegacyAuthStore.getState().logout();
  await signOut({ redirect: false });
}
