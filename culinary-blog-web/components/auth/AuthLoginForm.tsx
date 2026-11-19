'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { loginWithBackend } from '@/lib/api/auth-flow';
import { getApiErrorMessage } from '@/lib/api/errorMessage';

export function AuthLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useAuthStore((state) => state.user);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithBackend(email, password);
      router.push('/profile');
      router.refresh();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể đăng nhập. Vui lòng thử lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <p className="font-semibold">Bạn đã đăng nhập với tên {user.name}.</p>
        <p className="mt-1 break-all text-xs text-green-700">
          JWT access token đã được lưu trong localStorage.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/profile" className="btn btn-primary">
            Xem hồ sơ
          </Link>
          <Link href="/blog" className="btn btn-outline">
            Xem bài viết
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
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
            if (error) setError(null);
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
            if (error) setError(null);
          }}
          placeholder="Nhập mật khẩu"
          className="input"
          autoComplete="current-password"
        />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-medium text-orange-600 hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
}
