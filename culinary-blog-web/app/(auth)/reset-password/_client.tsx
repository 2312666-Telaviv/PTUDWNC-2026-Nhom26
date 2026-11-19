'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/api/services';
import Link from 'next/link';

const resetSchema = z.object({
  newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Mật khẩu nhập lại không khớp',
  path: ['confirmNewPassword'],
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';

  if (!email || !token) {
    toast({ title: 'Liên kết không hợp lệ', description: 'Vui lòng sử dụng liên kết từ email.', variant: 'destructive' });
    router.push('/login');
  }

  const form = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmNewPassword: '' },
  });

  async function onSubmit(data: ResetForm) {
    setIsLoading(true);
    try {
      await authService.resetPassword({ email, token, newPassword: data.newPassword });
      toast({ title: 'Đặt lại thành công', description: 'Bạn có thể đăng nhập với mật khẩu mới.' });
      router.push('/login');
    } catch (error: any) {
      toast({ title: 'Đặt lại thất bại', description: error.message ?? 'Vui lòng thử lại', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Đặt lại mật khẩu</CardTitle>
          <CardDescription>Tạo mật khẩu mới cho tài khoản của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                {...form.register('newPassword')}
              />
              {form.formState.errors.newPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Nhập lại mật khẩu mới</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder="••••••••"
                {...form.register('confirmNewPassword')}
              />
              {form.formState.errors.confirmNewPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.confirmNewPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !email || !token}>
              {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full variant-outline">
            <Link href="/login">Quay lại đăng nhập</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
