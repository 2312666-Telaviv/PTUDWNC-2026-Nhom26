'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { RegisterRequest } from '@/types/api';

export function AuthRegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const USE_MOCK_API =
    process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.USE_MOCK_API === 'true';

  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const clearError = useAuthStore((state) => state.clearError);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    setSuccess(null);

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

    setIsSubmitting(true);
    setLoading(true);
    clearError();

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5041').replace(/\/+$/, '');
    const registerData: RegisterRequest = {
      email: email.trim(),
      password,
      name: name.trim(),
    };

    try {
      const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
        try {
          const errorData = await response.json();
          if (typeof errorData === 'object' && errorData !== null) {
            const errors = (errorData as { errors?: unknown[] })?.errors;
            if (Array.isArray(errors)) {
              const messages = errors.map((e) => {
                const item = e as { description?: string; message?: string } | null | undefined;
                return String(item?.description || item?.message || item);
              }).join('; ');
              if (messages) {
                errorMessage = messages;
              } else if (errorData.title) {
                errorMessage = errorData.title;
              } else if (errorData.detail) {
                errorMessage = errorData.detail;
              }
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          }
        } catch {
          // Không parse được JSON, dùng thông báo mặc định
        }
        setServerError(errorMessage);
        setError(errorMessage);
        return;
      }

      setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
      setIsSubmitting(false);
      setLoading(false);

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend.';
      setServerError(message);
      setError(message);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-semibold text-green-800">{success}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link href="/login" className="btn btn-primary">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {USE_MOCK_API && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          <strong>Chế độ demo:</strong> Dùng mock API, tài khoản không được lưu vào database thật.
        </div>
      )}
      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
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
            if (serverError) setServerError(null);
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
            if (serverError) setServerError(null);
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
            if (serverError) setServerError(null);
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
            if (serverError) setServerError(null);
          }}
          placeholder="Nhập lại mật khẩu"
          className="input"
          autoComplete="new-password"
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
