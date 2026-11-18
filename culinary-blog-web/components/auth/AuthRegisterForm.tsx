'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

/**
 * Form đăng ký của blog app, dùng auth-store để lưu phiên đăng nhập sau khi đăng ký.
 * TODO: khi có API thật, thay đoạn gọi giả lập bằng POST /api/v1/auth/register
 * (lớp API của thành viên phụ trách phần 1 & 2) rồi gọi setAuth(user, token).
 */
export function AuthRegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const clearError = useAuthStore((state) => state.clearError);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setError('Vui lòng nhập họ tên.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Email không hợp lệ.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    clearError();

    // Giả lập gọi API trong 600ms
    window.setTimeout(() => {
      setAuth(
        {
          id: `mock-${email.trim()}`,
          email: email.trim(),
          name: name.trim(),
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
        <p className="font-semibold">Đăng ký thành công, chào mừng {user.name}.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/blog" className="btn btn-primary">
            Xem bài viết
          </Link>
          <Link href="/blog/new" className="btn btn-outline">
            Viết bài viết đầu tiên
          </Link>
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
        <label htmlFor="register-name" className="form-label">
          Họ tên
        </label>
        <input
          id="register-name"
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (error) clearError();
          }}
          placeholder="Nguyễn Văn A"
          className="input"
          autoComplete="name"
        />
      </div>

      <div>
        <label htmlFor="register-email" className="form-label">
          Email
        </label>
        <input
          id="register-email"
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
        <label htmlFor="register-password" className="form-label">
          Mật khẩu
        </label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (error) clearError();
          }}
          placeholder="Tối thiểu 6 ký tự"
          className="input"
          autoComplete="new-password"
        />
      </div>

      <div>
        <label htmlFor="register-confirm-password" className="form-label">
          Xác nhận mật khẩu
        </label>
        <input
          id="register-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            if (error) clearError();
          }}
          placeholder="Nhập lại mật khẩu"
          className="input"
          autoComplete="new-password"
        />
      </div>

      <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
        {isLoading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
      </button>

      <p className="text-center text-xs text-gray-400">
        Đây là giao diện tĩnh, dữ liệu đăng ký chỉ được lưu trong localStorage của trình duyệt.
      </p>
    </form>
  );
}
