import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthRegisterForm } from '@/components/auth/AuthRegisterForm';
import { AuthStoreHydration } from '@/components/auth/AuthStoreHydration';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Đăng ký',
  description: 'Tạo tài khoản Culinary Blog để chia sẻ công thức nấu ăn của bạn',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-orange-50/50 px-4 py-10 sm:py-16">
      <AuthStoreHydration />

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Tạo tài khoản</CardTitle>
          <CardDescription>Đăng ký để bắt đầu sử dụng ứng dụng</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">
            Chỉ mất vài giây để bắt đầu chia sẻ công thức cùng cộng đồng.
          </p>
          <AuthRegisterForm />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
          <p className="mt-4 text-center text-sm text-gray-500">
            Quay lại{' '}
            <Link href="/" className="font-medium text-orange-600 hover:underline">
              trang chủ
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
