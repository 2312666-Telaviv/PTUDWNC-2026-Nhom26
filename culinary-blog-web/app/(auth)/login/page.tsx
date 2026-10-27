'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/api/services';
import { useAuthStore } from '@/lib/stores/authStore';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const loginStore = useAuthStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      const { token, expiration } = await authService.login(data);

      // Lấy profile sau khi login để lưu vào store
      // (có thể trả về profile từ API login, nhưng ở đây gọi riêng)
      let profile: any = null;
      try {
        profile = await authService.getProfile();
      } catch {
        // Nếu get profile thất bại, vẫn lưu token
      }

      loginStore(token, profile ?? { id: '', email: data.email, userName: data.email });
      localStorage.setItem('token', token);

      toast({ title: 'Đăng nhập thành công', description: 'Chào mừng bạn quay lại!' });
      router.push('/profile');
    } catch (error: any) {
      toast({ title: 'Đăng nhập thất bại', description: error.message ?? 'Vui lòng thử lại', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
          <CardDescription>Nhập thông tin tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-center text-muted-foreground">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </p>
          <p className="text-sm text-center text-muted-foreground">
            <Link href="/forgot-password" className="font-medium text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
