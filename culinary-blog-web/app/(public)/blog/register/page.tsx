import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthRegisterForm } from '@/components/auth/AuthRegisterForm';
import { AuthStoreHydration } from '@/components/auth/AuthStoreHydration';

export const metadata: Metadata = {
  title: 'Đăng ký',
  description: 'Tạo tài khoản Culinary Blog để chia sẻ công thức nấu ăn của bạn',
};

/**
 * Màn hình đăng ký của blog app (/blog/register).
 * TODO: khi có API thật, nối form với POST /api/v1/auth/register.
 */
export default function BlogRegisterPage() {
  return (
    <div className="bg-orange-50/50 px-4 py-10 sm:py-16">
      <AuthStoreHydration />

      <div className="mx-auto max-w-md">
        <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
          <p className="mt-1 text-sm text-gray-600">
            Chỉ mất vài giây để bắt đầu chia sẻ công thức cùng cộng đồng.
          </p>

          <div className="mt-6">
            <AuthRegisterForm />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link href="/blog/login" className="font-medium text-orange-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-gray-500">
          Quay lại{' '}
          <Link href="/blog" className="font-medium text-orange-600 hover:underline">
            trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
