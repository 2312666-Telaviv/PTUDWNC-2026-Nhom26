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
import Link from 'next/link';

const forgotSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data: ForgotForm) {
    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: data.email });
      setSent(true);
      toast({ title: 'Đã gửi', description: 'Kiểm tra email của bạn để đặt lại mật khẩu.' });
    } catch (error: any) {
      toast({ title: 'Gửi thất bại', description: error.message ?? 'Vui lòng thử lại', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Kiểm tra email</CardTitle>
            <CardDescription>Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn.</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Vui lòng mở hộp thư email và làm theo hướng dẫn.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">Quay lại đăng nhập</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Quên mật khẩu</CardTitle>
          <CardDescription>Nhập email để nhận liên kết đặt lại mật khẩu.</CardDescription>
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
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
