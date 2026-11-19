'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { loginWithBackend } from '@/lib/api/auth-flow';
import { getApiErrorMessage } from '@/lib/api/errorMessage';

interface LoginFormProps {
  callbackUrl: string;
  googleEnabled: boolean;
}

export function LoginForm({ callbackUrl, googleEnabled }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await loginWithBackend(email, password);
      router.push(callbackUrl || '/dashboard');
      router.refresh();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể đăng nhập. Vui lòng thử lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-orange-600 px-4 py-2 font-medium text-white transition hover:bg-orange-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>

      {googleEnabled && (
        <div className="space-y-3">
          <div className="relative my-2">
              <div className="absolute inset-0">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-500">hoặc</span>
            </div>
          </div>
          <GoogleSignInButton callbackUrl={callbackUrl} />
        </div>
      )}
    </form>
  );
}
