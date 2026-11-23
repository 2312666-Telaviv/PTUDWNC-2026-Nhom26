'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/lib/api/services';
import { loginWithBackend, logoutFromBackend } from '@/lib/api/auth-flow';
import { getApiErrorMessage } from '@/lib/api/errorMessage';

export function AuthRegisterForm() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const isLoggedIn = !!user || !!session?.user;
  const displayName = user?.name || session?.user?.name || session?.user?.email || 'người dùng';

  const handleLogoutForRegistration = async () => {
    setIsLoggingOut(true);
    try {
      await logoutFromBackend({ redirectTo: pathname || '/register' });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    setSuccess(null);

    const normalizedFullName = fullName.trim();
    const normalizedEmail = email.trim();

    if (!normalizedFullName) {
      setServerError('Vui lòng nhập họ tên.');
      return;
    }
    if (normalizedFullName.length < 2 || normalizedFullName.length > 50) {
      setServerError('Họ tên phải có từ 2 đến 50 ký tự.');
      return;
    }
    if (/[<>]/.test(normalizedFullName)) {
      setServerError('Họ tên không được chứa ký tự < hoặc >.');
      return;
    }
    if (normalizedFullName.toLowerCase() === normalizedEmail.toLowerCase()) {
      setServerError('Họ tên không được trùng với email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setServerError('Email không hợp lệ.');
      return;
    }
    if (password.length < 6) {
      setServerError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (!confirmPassword) {
      setServerError('Vui lòng nhập xác nhận mật khẩu.');
      return;
    }
    if (password !== confirmPassword) {
      setServerError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.register({
        fullName: normalizedFullName,
        email: normalizedEmail,
        password,
        confirmPassword,
      });

      try {
        await loginWithBackend(email, password);
        setSuccess('Đăng ký và đăng nhập thành công!');
        window.setTimeout(() => router.push('/profile'), 1200);
      } catch {
        setSuccess('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
        window.setTimeout(() => router.push('/login'), 1500);
      }
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' && !user) {
    return (
      <div className="rounded-md border border-orange-100 bg-orange-50 p-4 text-sm text-gray-600">
        Đang kiểm tra trạng thái đăng nhập...
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <p className="font-semibold">Bạn đã đăng nhập với tên {displayName}.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/profile" className="btn btn-primary">
            Xem hồ sơ
          </Link>
          <Link href="/blog" className="btn btn-outline">
            Xem bài viết
          </Link>
        </div>
        <div className="mt-3 border-t border-green-200 pt-3">
          <button
            type="button"
            onClick={() => void handleLogoutForRegistration()}
            disabled={isLoggingOut}
            className="btn btn-outline w-full"
          >
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất để đăng ký tài khoản khác'}
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-semibold text-green-800">{success}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link href="/login" className="btn btn-primary">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="register-full-name" className="form-label">
          Họ và tên
        </label>
        <input
          id="register-full-name"
          type="text"
          value={fullName}
          onChange={(event) => {
            setFullName(event.target.value);
            if (serverError) setServerError(null);
          }}
          placeholder="Nguyễn Văn A"
          className="input"
          autoComplete="name"
          maxLength={50}
          required
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
            if (serverError) setServerError(null);
          }}
          placeholder="ban@example.com"
          className="input"
          autoComplete="email"
          required
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
            if (serverError) setServerError(null);
          }}
          placeholder="Tối thiểu 6 ký tự"
          className="input"
          autoComplete="new-password"
          required
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
            if (serverError) setServerError(null);
          }}
          placeholder="Nhập lại mật khẩu"
          className="input"
          autoComplete="new-password"
          required
        />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
        {isSubmitting ? 'Đang đăng ký...' : 'Tạo tài khoản'}
      </button>

      <p className="mt-4 text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-medium text-orange-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
