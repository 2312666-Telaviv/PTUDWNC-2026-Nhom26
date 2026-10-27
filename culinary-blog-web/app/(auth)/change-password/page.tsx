'use client';

import { useState } from 'react';
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
import Link from 'next/link';

const changeSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Mật khẩu mới nhập lại không khớp',
  path: ['confirmNewPassword'],
});

type ChangeForm = z.infer<typeof changeSchema>;

export default function ChangePasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, logout } = useAuthStore();

  const form = useForm<ChangeForm>({
    resolver: zodResolver(changeSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  async function onSubmit(data: ChangeForm) {
    setIsLoading(true);
    try {
      await authService.changePassword({
        email: user?.email ?? '',
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast({ title: 'Thành công', description: 'Mật khẩu đã được thay đổi.' });
      form.reset();
    } catch (error: any) {
      toast({ title: 'Thay đổi thất bại', description: error.message ?? 'Vui lòng thử lại', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>Cập nhật mật khẩu mới cho tài khoản của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                {...form.register('currentPassword')}
              />
              {form.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.currentPassword.message}</p>
              )}
            </div>

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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full variant-outline">
            <Link href="/profile">Quay lại hồ sơ</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
