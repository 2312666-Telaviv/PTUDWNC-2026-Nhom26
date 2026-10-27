'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/api/services';
import { useAuthStore } from '@/lib/stores/authStore';

const updateProfileSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, token, logout, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { email: user?.email ?? '' },
  });

  useEffect(() => {
    if (user?.email) {
      form.setValue('email', user.email);
    }
  }, [user]);

  async function onSubmit(data: UpdateProfileForm) {
    setIsLoading(true);
    try {
      await authService.updateProfile(data);
      const updatedUser = { ...user, email: data.email } as any;
      setUser(updatedUser, token ?? null);
      toast({ title: 'Thành công', description: 'Hồ sơ đã được cập nhật.' });
    } catch (error: any) {
      toast({ title: 'Cập nhật thất bại', description: error.message ?? 'Vui lòng thử lại', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {
      // Bỏ qua lỗi khi gọi logout API
    }
    logout();
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground">Đang tải hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 mb-8">
          <Button asChild variant="outline" size="sm">
            <a href="/recipes" className="text-sm">← Quay lại công thức</a>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Thông tin hồ sơ */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Hồ sơ của bạn</CardTitle>
              <CardDescription>Quản lý thông tin tài khoản cá nhân.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id">Mã người dùng</Label>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{user.id}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="userName">Tên người dùng</Label>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{user.userName}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{user.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Form cập nhật email */}
          <Card>
            <CardHeader>
              <CardTitle>Cập nhật email</CardTitle>
              <CardDescription>Thay đổi địa chỉ email của tài khoản.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email mới</Label>
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

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn đổi mật khẩu?')) {
                      // Redirect to change password page
                    }
                  }}
                >
                  Đổi mật khẩu
                </Button>
                <a href="/auth/change-password" className="ml-auto text-sm text-primary hover:underline">
                  Đi đến trang đổi mật khẩu
                </a>
              </div>

              <div className="mt-4">
                <Button variant="outline" onClick={handleLogout} className="w-full">
                  Đăng xuất
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
