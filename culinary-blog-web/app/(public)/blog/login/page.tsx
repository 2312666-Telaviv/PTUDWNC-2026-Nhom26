import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthLoginForm } from '@/components/auth/AuthLoginForm';
import { AuthStoreHydration } from '@/components/auth/AuthStoreHydration';

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập vào tài khoản Culinary Blog của bạn',
};

/**
 * Màn hình đăng nhập của blog app (/blog/login).
 * TODO: khi có API thật, điều hướng về trang chủ bằng router.push sau khi đăng nhập thành công.
 */
export default function BlogLoginPage() {
  return (
    <div className="bg-orange-50/50 px-4 py-10 sm:py-16">
      <AuthStoreHydration />

      <div className="mx-auto max-w-md">
        <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
          <p className="mt-1 text-sm text-gray-600">
            Đăng nhập để viết bài và trả lời bình luận trên blog.
          </p>

          <div className="mt-6">
            <AuthLoginForm />
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Quay lại{' '}
          <Link href="/blog" className="font-medium text-orange-600 hover:underline">
            trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
