import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-background px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
          <CardDescription>Nhập thông tin tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm callbackUrl={callbackUrl || '/dashboard'} googleEnabled={googleEnabled} />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/forgot-password" className="font-medium text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
