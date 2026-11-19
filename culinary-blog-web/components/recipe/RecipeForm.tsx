'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileUpload } from '@/components/ui/file-upload';
import type { RecipeStatus } from '@/types/api';

const recipeSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tên công thức').max(200, 'Tối đa 200 ký tự'),
  description: z.string().min(1, 'Vui lòng nhập mô tả').max(2000, 'Tối đa 2000 ký tự'),
  slug: z.string().min(1, 'Vui lòng nhập slug').max(100, 'Tối đa 100 ký tự'),
  prepTimeMinutes: z.coerce.number().min(1, 'Phải lớn hơn 0').max(1440, 'Tối đa 1440 phút'),
  cookTimeMinutes: z.coerce.number().min(1, 'Phải lớn hơn 0').max(1440, 'Tối đa 1440 phút'),
  servings: z.coerce.number().min(1, 'Phải lớn hơn 0').max(50, 'Tối đa 50 người'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  categoryName: z.string().min(1, 'Vui lòng nhập tên danh mục').max(100, 'Tối đa 100 ký tự'),
  instructions: z.string().optional(),
});

type LocalRecipeFormValues = z.infer<typeof recipeSchema>;

const difficultyOptions: { value: 'Easy' | 'Medium' | 'Hard'; label: string }[] = [
  { value: 'Easy', label: 'Dễ' },
  { value: 'Medium', label: 'Trung bình' },
  { value: 'Hard', label: 'Khó' },
];

export const defaultRecipeValues: LocalRecipeFormValues = {
  title: '',
  description: '',
  slug: '',
  prepTimeMinutes: 15,
  cookTimeMinutes: 30,
  servings: 2,
  difficulty: 'Easy',
  categoryName: '',
  instructions: '',
};

interface RecipeFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<LocalRecipeFormValues>;
  existingImageUrl?: string | null;
  isLoading?: boolean;
  onSubmitForm: (
    values: LocalRecipeFormValues,
    imageFile: File | null,
    status?: RecipeStatus
  ) => Promise<void>;
}

export function RecipeForm({
  mode,
  defaultValues,
  existingImageUrl,
  isLoading = false,
  onSubmitForm,
}: RecipeFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const form = useForm<LocalRecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: { ...defaultRecipeValues, ...defaultValues },
  });
  const difficulty = form.watch('difficulty');

  const submitWithStatus = (status?: RecipeStatus) =>
    form.handleSubmit(async (values) => {
      await onSubmitForm(values, imageFile, status);
    });

  return (
    <form onSubmit={submitWithStatus(undefined)} className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2 mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/recipes/manage">← Quản lý công thức</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{mode === 'create' ? 'Tạo công thức mới' : 'Chỉnh sửa công thức'}</CardTitle>
              <CardDescription>
                Nhập thông tin chi tiết và upload ảnh minh họa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Tên công thức *</Label>
                  <Input id="title" placeholder="Ví dụ: Phở bò Hà Nội" {...form.register('title')} />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug URL *</Label>
                  <Input id="slug" placeholder="pho-bo-ha-noi" {...form.register('slug')} />
                  <p className="text-xs text-muted-foreground">Dùng trong URL, chỉ chữ cái, số và dấu gạch ngang</p>
                  {form.formState.errors.slug && (
                    <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả công thức *</Label>
                <Input id="description" placeholder="Mô tả ngắn gọn về món ăn..." {...form.register('description')} />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Hướng dẫn nấu ăn</Label>
                <Input id="instructions" placeholder="Cách nấu chi tiết từng bước..." {...form.register('instructions')} />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="prepTimeMinutes">Thời gian chuẩn bị (phút)</Label>
                  <Input id="prepTimeMinutes" type="number" {...form.register('prepTimeMinutes')} />
                  {form.formState.errors.prepTimeMinutes && (
                    <p className="text-sm text-destructive">{form.formState.errors.prepTimeMinutes.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cookTimeMinutes">Thời gian nấu (phút)</Label>
                  <Input id="cookTimeMinutes" type="number" {...form.register('cookTimeMinutes')} />
                  {form.formState.errors.cookTimeMinutes && (
                    <p className="text-sm text-destructive">{form.formState.errors.cookTimeMinutes.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servings">Số người ăn</Label>
                  <Input id="servings" type="number" {...form.register('servings')} />
                  {form.formState.errors.servings && (
                    <p className="text-sm text-destructive">{form.formState.errors.servings.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Độ khó</Label>
                <div className="flex gap-2">
                  {difficultyOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={difficulty === opt.value ? 'default' : 'outline'}
                      onClick={() => form.setValue('difficulty', opt.value)}
                      className="flex-1 text-sm"
                    >
                      {opt.label}
                    </Button>
                  ))}
                  <input type="hidden" {...form.register('difficulty')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryName">Tên danh mục *</Label>
                <Input id="categoryName" placeholder="Ví dụ: Món chính, Món chay..." {...form.register('categoryName')} />
                {form.formState.errors.categoryName && (
                  <p className="text-sm text-destructive">{form.formState.errors.categoryName.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <FileUpload
            currentFile={imageFile}
            existingImageUrl={existingImageUrl}
            onFileChange={setImageFile}
            disabled={isLoading}
          />

          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mode === 'create' ? (
                <>
                  <Button type="button" variant="outline" className="w-full" disabled={isLoading} onClick={submitWithStatus('Draft')}>
                    Lưu nháp
                  </Button>
                  <Button type="button" className="w-full" disabled={isLoading} onClick={submitWithStatus('Published')}>
                    Đăng công thức
                  </Button>
                </>
              ) : (
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              )}
              <Button asChild variant="ghost" className="w-full">
                <Link href="/recipes/manage">Hủy</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lưu ý</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Ảnh tối đa 10MB, định dạng JPG, PNG, WEBP, GIF.</li>
                <li>Bản nháp (Draft) chưa hiển thị công khai.</li>
                <li>Trạng thái có thể đổi ở trang quản lý.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
