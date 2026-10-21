'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

/**
 * Form đăng nhập của blog app, dùng auth-store để lưu phiên đăng nhập.
 * TODO: khi có API thật, thay đoạn gọi giả lập bằng POST /api/v1/auth/login
 * (lớp API của thành viên phụ trách phần 1 & 2) rồi gọi setAuth(user, token).
 */
export function AuthLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const clearError = useAuthStore((state) => state.clearError);
  const logout = useAuthStore((state) => state.logout);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    clearError();

    // Giả lập gọi API trong 600ms
    window.setTimeout(() => {
      const name = email.split('@')[0] || 'Người dùng';
      setAuth(
        {
          id: `mock-${email.trim()}`,
          email: email.trim(),
          name: name.charAt(0).toUpperCase() + name.slice(1),
          avatarUrl: null,
          roles: ['User'],
        },
        'mock-access-token'
      );
      setLoading(false);
    }, 600);
  };

  if (user) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <p className="font-semibold">Bạn đã đăng nhập với tên {user.name}.</p>
        <p className="mt-1 break-all text-xs text-green-700">
          Access token: {user.id ? 'đã lưu trong localStorage' : 'chưa có'}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/blog" className="btn btn-primary">
            Xem bài viết
          </Link>
          <button type="button" onClick={logout} className="btn btn-outline">
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="login-email" className="form-label">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) clearError();
          }}
          placeholder="ban@example.com"
          className="input"
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="form-label">
          Mật khẩu
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (error) clearError();
          }}
          placeholder="Nhập mật khẩu"
          className="input"
          autoComplete="current-password"
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-gray-600">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-orange-600" />
          Ghi nhớ đăng nhập
        </label>
        <span className="text-gray-400">Quên mật khẩu?</span>
      </div>

      <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>

      <p className="text-center text-xs text-gray-400">
        Đây là giao diện tĩnh, dữ liệu đăng nhập chỉ được lưu trong localStorage của trình duyệt.
      </p>
    </form>
  );
}
