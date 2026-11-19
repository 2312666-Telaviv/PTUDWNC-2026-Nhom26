'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RecipeForm } from '@/components/recipe/RecipeForm';
import { useToast } from '@/components/ui/use-toast';
import { recipeService } from '@/lib/api/services';
import { useAuthStore } from '@/lib/stores/authStore';
import type { RecipeDto, RecipeFormValues } from '@/types/api';

export default function EditRecipePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [recipe, setRecipe] = useState<RecipeDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const id = Number(params.id);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !Number.isFinite(id)) return;
    recipeService
      .getById(id)
      .then(setRecipe)
      .catch(() => setRecipe(null))
      .finally(() => setIsLoading(false));
  }, [mounted, id]);

  if (!mounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Yêu cầu đăng nhập</CardTitle>
            <CardDescription>Bạn cần đăng nhập để chỉnh sửa công thức.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button asChild><Link href="/login">Đăng nhập</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <div className="container mx-auto py-12 text-center text-muted-foreground">Đang tải công thức...</div>;
  }

  if (!recipe) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-semibold text-red-600">Không tìm thấy công thức</h1>
        <Button asChild className="mt-6"><Link href="/recipes/manage">Về trang quản lý</Link></Button>
      </div>
    );
  }

  if (user && recipe.authorId && recipe.authorId !== user.id) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-semibold text-red-600">Bạn không có quyền chỉnh sửa công thức này.</h1>
        <Button asChild className="mt-6"><Link href="/recipes/manage">Về trang quản lý</Link></Button>
      </div>
    );
  }

  async function handleSubmit(values: RecipeFormValues, imageFile: File | null) {
    setIsSaving(true);
    try {
      await recipeService.updateRecipe(id, { ...values, imageFile });
      toast({
        title: 'Cập nhật thành công',
        description: `Công thức "${values.title}" đã được lưu.`,
      });
      router.push('/recipes/manage');
    } catch (error: any) {
      toast({
        title: 'Cập nhật thất bại',
        description: error.message ?? 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <RecipeForm
      mode="edit"
      isLoading={isSaving}
      defaultValues={{
        title: recipe.title,
        description: recipe.description,
        slug: recipe.slug,
        prepTimeMinutes: recipe.prepTimeMinutes,
        cookTimeMinutes: recipe.cookTimeMinutes,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        categoryName: recipe.categoryName,
        instructions: recipe.instructions ?? '',
      }}
      existingImageUrl={recipe.imageUrl ?? recipe.primaryImageUrl}
      onSubmitForm={handleSubmit}
    />
  );
}
