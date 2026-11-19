'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RecipeForm } from '@/components/recipe/RecipeForm';
import { useToast } from '@/components/ui/use-toast';
import { recipeService } from '@/lib/api/services';
import { useAuthStore } from '@/lib/stores/authStore';
import type { RecipeFormValues, RecipeStatus } from '@/types/api';

export default function CreateRecipePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Yêu cầu đăng nhập</CardTitle>
            <CardDescription>Bạn cần đăng nhập để tạo công thức mới.</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Vui lòng đăng nhập để tiếp tục.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">Đăng nhập ngay</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  async function handleSubmit(values: RecipeFormValues, imageFile: File | null, status?: RecipeStatus) {
    setIsLoading(true);
    try {
      const result = await recipeService.createRecipe({ ...values, imageFile, status });
      toast({
        title: 'Tạo công thức thành công',
        description: status === 'Draft'
          ? `Công thức "${values.title}" đã được lưu thành bản nháp.`
          : `Công thức "${values.title}" đã được đăng công khai.`,
      });
      router.push('/recipes/manage');
    } catch (error: any) {
      toast({
        title: 'Tạo công thức thất bại',
        description: error.message ?? 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <RecipeForm
      mode="create"
      isLoading={isLoading}
      onSubmitForm={handleSubmit}
    />
  );
}
