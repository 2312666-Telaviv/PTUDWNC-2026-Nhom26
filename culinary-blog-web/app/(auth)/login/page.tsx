import { Metadata } from 'next';
import { LoginForm } from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Đăng nhập',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  // Chỉ hiển thị nút Google khi được bật; biến NEXT_PUBLIC_ được nhúng lúc build,
  // không lộ client_id/secret cho phía client.
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === 'true';

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Đăng nhập</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <LoginForm callbackUrl={callbackUrl || '/dashboard'} googleEnabled={googleEnabled} />
      </div>
    </div>
  );
}
