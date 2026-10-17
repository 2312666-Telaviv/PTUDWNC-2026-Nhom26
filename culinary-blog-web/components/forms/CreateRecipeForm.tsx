'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRecipeSchema, CreateRecipeFormData } from '@/types/recipe';
import { useCreateRecipe, RecipeFieldErrors } from '@/hooks/useRecipes';
import { CategoryDto } from '@/lib/mock/categories';

interface CreateRecipeFormProps {
  categories: CategoryDto[];
}

const difficultyOptions: { value: CreateRecipeFormData['difficulty']; label: string }[] = [
  { value: 'Easy', label: 'Dễ' },
  { value: 'Medium', label: 'Trung bình' },
  { value: 'Hard', label: 'Khó' },
];

export function CreateRecipeForm({ categories }: CreateRecipeFormProps) {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<CreateRecipeFormData>({
    resolver: zodResolver(createRecipeSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      prepTimeMinutes: 15,
      cookTimeMinutes: 30,
      servings: 4,
      difficulty: 'Medium',
      steps: [{ description: '', durationMinutes: undefined }],
      ingredients: [{ name: '', quantity: 1, unit: '', notes: '' }],
    },
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({ control, name: 'steps' });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: 'ingredients' });

  // Lỗi 422 từ server: gán vào từng field tương ứng của form
  const handleValidationError = (fieldErrors: RecipeFieldErrors) => {
    Object.entries(fieldErrors).forEach(([path, message]) => {
      setError(path as keyof CreateRecipeFormData, { type: 'server', message });
    });
  };

  const createRecipe = useCreateRecipe({ onValidationError: handleValidationError });

  const isMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

  const onSubmit = (data: CreateRecipeFormData) => {
    createRecipe.mutate(data, {
      onSuccess: (result) => {
        if (isMock) {
          // Chế độ mock: món mới không có trong dữ liệu mock nên chỉ thông báo rồi về dashboard
          setSuccessMessage('Đăng công thức thành công! Đang chuyển về trang tổng quan...');
          reset();
          setTimeout(() => router.push('/dashboard'), 1500);
        } else {
          router.push(`/recipes/${result.slug}`);
          router.refresh();
        }
      },
    });
  };

  const submitting = isSubmitting || createRecipe.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {successMessage && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-700">
          {successMessage}
        </div>
      )}

      {/* Thông tin cơ bản */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h2>

        <div>
          <label htmlFor="title" className="form-label">
            Tên công thức
          </label>
          <input id="title" type="text" className={`input ${errors.title ? 'input-error' : ''}`} {...register('title')} />
          {errors.title && <p className="form-error">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="form-label">
            Mô tả (không bắt buộc, 20-500 ký tự)
          </label>
          <textarea
            id="description"
            className={`textarea ${errors.description ? 'input-error' : ''}`}
            {...register('description', { setValueAs: (v) => (v === '' ? undefined : v) })}
          />
          {errors.description && <p className="form-error">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="categoryId" className="form-label">
              Danh mục
            </label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <select id="categoryId" className={`select ${errors.categoryId ? 'input-error' : ''}`} {...field}>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.categoryId && <p className="form-error">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label htmlFor="difficulty" className="form-label">
              Độ khó
            </label>
            <Controller
              control={control}
              name="difficulty"
              render={({ field }) => (
                <select id="difficulty" className={`select ${errors.difficulty ? 'input-error' : ''}`} {...field}>
                  {difficultyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.difficulty && <p className="form-error">{errors.difficulty.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="prepTimeMinutes" className="form-label">
              Thời gian chuẩn bị (phút)
            </label>
            <input
              id="prepTimeMinutes"
              type="number"
              className={`input ${errors.prepTimeMinutes ? 'input-error' : ''}`}
              {...register('prepTimeMinutes', { valueAsNumber: true })}
            />
            {errors.prepTimeMinutes && <p className="form-error">{errors.prepTimeMinutes.message}</p>}
          </div>

          <div>
            <label htmlFor="cookTimeMinutes" className="form-label">
              Thời gian nấu (phút)
            </label>
            <input
              id="cookTimeMinutes"
              type="number"
              className={`input ${errors.cookTimeMinutes ? 'input-error' : ''}`}
              {...register('cookTimeMinutes', { valueAsNumber: true })}
            />
            {errors.cookTimeMinutes && <p className="form-error">{errors.cookTimeMinutes.message}</p>}
          </div>

          <div>
            <label htmlFor="servings" className="form-label">
              Khẩu phần
            </label>
            <input
              id="servings"
              type="number"
              className={`input ${errors.servings ? 'input-error' : ''}`}
              {...register('servings', { valueAsNumber: true })}
            />
            {errors.servings && <p className="form-error">{errors.servings.message}</p>}
          </div>
        </div>
      </section>

      {/* Nguyên liệu */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Nguyên liệu</h2>
          <button
            type="button"
            className="btn btn-outline text-sm"
            onClick={() => appendIngredient({ name: '', quantity: 1, unit: '', notes: '' })}
          >
            + Thêm nguyên liệu
          </button>
        </div>

        {errors.ingredients?.root && <p className="form-error">{errors.ingredients.root.message}</p>}

        <div className="space-y-4">
          {ingredientFields.map((field, index) => (
            <div key={field.id} className="rounded-md border border-orange-100 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="form-label">Tên nguyên liệu</label>
                  <input
                    type="text"
                    className={`input ${errors.ingredients?.[index]?.name ? 'input-error' : ''}`}
                    {...register(`ingredients.${index}.name` as const)}
                  />
                  {errors.ingredients?.[index]?.name && (
                    <p className="form-error">{errors.ingredients[index]?.name?.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Số lượng</label>
                    <input
                      type="number"
                      step="any"
                      className={`input ${errors.ingredients?.[index]?.quantity ? 'input-error' : ''}`}
                      {...register(`ingredients.${index}.quantity` as const, { valueAsNumber: true })}
                    />
                    {errors.ingredients?.[index]?.quantity && (
                      <p className="form-error">{errors.ingredients[index]?.quantity?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="form-label">Đơn vị</label>
                    <input
                      type="text"
                      className={`input ${errors.ingredients?.[index]?.unit ? 'input-error' : ''}`}
                      {...register(`ingredients.${index}.unit` as const)}
                    />
                    {errors.ingredients?.[index]?.unit && (
                      <p className="form-error">{errors.ingredients[index]?.unit?.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <label className="form-label">Ghi chú (không bắt buộc)</label>
                  <input
                    type="text"
                    className="input"
                    {...register(`ingredients.${index}.notes` as const, {
                      setValueAs: (v) => (v === '' ? undefined : v),
                    })}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-outline text-sm"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredientFields.length === 1}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Các bước thực hiện */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Các bước thực hiện</h2>
          <button
            type="button"
            className="btn btn-outline text-sm"
            onClick={() => appendStep({ description: '', durationMinutes: undefined })}
          >
            + Thêm bước
          </button>
        </div>

        {errors.steps?.root && <p className="form-error">{errors.steps.root.message}</p>}

        <div className="space-y-4">
          {stepFields.map((field, index) => (
            <div key={field.id} className="rounded-md border border-orange-100 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-orange-700">Bước {index + 1}</span>
                <button
                  type="button"
                  className="btn btn-outline text-sm"
                  onClick={() => removeStep(index)}
                  disabled={stepFields.length === 1}
                >
                  Xóa
                </button>
              </div>

              <div>
                <label className="form-label">Mô tả bước (ít nhất 10 ký tự)</label>
                <textarea
                  className={`textarea ${errors.steps?.[index]?.description ? 'input-error' : ''}`}
                  {...register(`steps.${index}.description` as const)}
                />
                {errors.steps?.[index]?.description && (
                  <p className="form-error">{errors.steps[index]?.description?.message}</p>
                )}
              </div>

              <div className="mt-3 max-w-xs">
                <label className="form-label">Thời gian (phút, không bắt buộc)</label>
                <input
                  type="number"
                  className={`input ${errors.steps?.[index]?.durationMinutes ? 'input-error' : ''}`}
                  {...register(`steps.${index}.durationMinutes` as const, {
                    setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                  })}
                />
                {errors.steps?.[index]?.durationMinutes && (
                  <p className="form-error">{errors.steps[index]?.durationMinutes?.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Đang lưu...' : 'Đăng công thức'}
        </button>
      </div>
    </form>
  );
}
