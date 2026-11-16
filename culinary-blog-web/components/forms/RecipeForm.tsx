'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recipeSchema, RecipeFormData } from '@/types/recipe';
import {
  RecipeFieldErrors,
  useCreateRecipe,
  useUpdateRecipe,
} from '@/hooks/useRecipes';
import { getApiErrorMessage } from '@/lib/api/errorMessage';
import type { CategoryDto } from '@/types/category';
import type { RecipeRequest, RecipeStatus } from '@/types/api';

interface RecipeFormProps {
  categories: CategoryDto[];
  mode: 'create' | 'edit';
  recipeId?: number;
  initialValues?: RecipeFormData;
  initialStatus?: RecipeStatus;
}

const difficultyOptions: { value: RecipeFormData['difficulty']; label: string }[] = [
  { value: 'Easy', label: 'Dễ' },
  { value: 'Medium', label: 'Trung bình' },
  { value: 'Hard', label: 'Khó' },
];

const emptyValues: RecipeFormData = {
  title: '',
  description: '',
  categoryId: '',
  prepTimeMinutes: 15,
  cookTimeMinutes: 30,
  servings: 4,
  difficulty: 'Medium',
  primaryImageUrl: '',
  tags: '',
  steps: [{ title: '', description: '', durationMinutes: undefined }],
  ingredients: [{ name: '', quantity: '', unit: '' }],
};

export function RecipeForm({
  categories,
  mode,
  recipeId,
  initialValues,
  initialStatus,
}: RecipeFormProps) {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: initialValues ?? emptyValues,
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

  const handleValidationError = (fieldErrors: RecipeFieldErrors) => {
    Object.entries(fieldErrors).forEach(([path, message]) => {
      setError(path as keyof RecipeFormData, { type: 'server', message });
    });
  };

  const createRecipe = useCreateRecipe({ onValidationError: handleValidationError });
  const updateRecipe = useUpdateRecipe(recipeId ?? 0, {
    onValidationError: handleValidationError,
  });

  const submitting = isSubmitting || createRecipe.isPending || updateRecipe.isPending;

  const onSubmit = async (data: RecipeFormData, status?: RecipeStatus) => {
    setSuccessMessage(null);
    setFormError(null);

    const payload: RecipeRequest = {
      ...data,
      status: mode === 'create' ? status === 'Published' ? 'Published' : 'Draft' : undefined,
    };

    try {
      if (mode === 'create') {
        const result = await createRecipe.mutateAsync(payload);
        setSuccessMessage(
          result.status === 'Published'
            ? 'Đã xuất bản công thức. Đang chuyển đến trang công thức...'
            : 'Đã lưu bản nháp. Đang chuyển đến trang chỉnh sửa...'
        );

        const target =
          result.status === 'Published' ? `/recipes/${result.slug}` : `/recipes/${result.id}/edit`;
        setTimeout(() => {
          router.push(target);
          router.refresh();
        }, 900);
        return;
      }

      await updateRecipe.mutateAsync(payload);
      setSuccessMessage('Đã lưu thay đổi.');
      router.refresh();
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Không thể lưu công thức. Vui lòng thử lại.'));
    }
  };

  const submitSave = handleSubmit((data) => onSubmit(data, initialStatus));
  const submitDraft = handleSubmit((data) => onSubmit(data, 'Draft'));
  const submitPublish = handleSubmit((data) => onSubmit(data, 'Published'));

  return (
    <form onSubmit={submitSave} className="space-y-8">
      {successMessage && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-700">
          {successMessage}
        </div>
      )}

      {formError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {formError}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h2>

        <div>
          <label htmlFor="title" className="form-label">
            Tên công thức
          </label>
          <input
            id="title"
            type="text"
            className={`input ${errors.title ? 'input-error' : ''}`}
            {...register('title')}
          />
          {errors.title && <p className="form-error">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="form-label">
            Mô tả (ít nhất 20 ký tự)
          </label>
          <textarea
            id="description"
            className={`textarea ${errors.description ? 'input-error' : ''}`}
            {...register('description')}
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
                <select
                  id="categoryId"
                  className={`select ${errors.categoryId ? 'input-error' : ''}`}
                  {...field}
                >
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
                <select
                  id="difficulty"
                  className={`select ${errors.difficulty ? 'input-error' : ''}`}
                  {...field}
                >
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
            {errors.prepTimeMinutes && (
              <p className="form-error">{errors.prepTimeMinutes.message}</p>
            )}
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
            {errors.cookTimeMinutes && (
              <p className="form-error">{errors.cookTimeMinutes.message}</p>
            )}
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

        <div>
          <label htmlFor="primaryImageUrl" className="form-label">
            Ảnh chính (URL)
          </label>
          <input
            id="primaryImageUrl"
            type="text"
            placeholder="https://... hoặc /images/..."
            className={`input ${errors.primaryImageUrl ? 'input-error' : ''}`}
            {...register('primaryImageUrl')}
          />
          {errors.primaryImageUrl && (
            <p className="form-error">{errors.primaryImageUrl.message}</p>
          )}
          {/* TODO: thay input URL bằng upload ảnh khi backend hỗ trợ. */}
        </div>

        <div>
          <label htmlFor="tags" className="form-label">
            Tags (phân tách bằng dấu phẩy)
          </label>
          <input
            id="tags"
            type="text"
            placeholder="ví dụ: món Việt, dễ làm, ăn sáng"
            className={`input ${errors.tags ? 'input-error' : ''}`}
            {...register('tags')}
          />
          {errors.tags && <p className="form-error">{errors.tags.message}</p>}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Nguyên liệu</h2>
          <button
            type="button"
            className="btn btn-outline text-sm"
            onClick={() => appendIngredient({ name: '', quantity: '', unit: '' })}
          >
            + Thêm nguyên liệu
          </button>
        </div>

        {errors.ingredients?.root && (
          <p className="form-error">{errors.ingredients.root.message}</p>
        )}

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
                      type="text"
                      className={`input ${errors.ingredients?.[index]?.quantity ? 'input-error' : ''}`}
                      {...register(`ingredients.${index}.quantity` as const)}
                    />
                    {errors.ingredients?.[index]?.quantity && (
                      <p className="form-error">
                        {errors.ingredients[index]?.quantity?.message}
                      </p>
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

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  className="btn btn-outline text-sm"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredientFields.length === 1}
                >
                  Xóa nguyên liệu
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Các bước thực hiện</h2>
          <button
            type="button"
            className="btn btn-outline text-sm"
            onClick={() =>
              appendStep({ title: '', description: '', durationMinutes: undefined })
            }
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
                  Xóa bước
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="form-label">Tiêu đề bước (không bắt buộc)</label>
                  <input
                    type="text"
                    className={`input ${errors.steps?.[index]?.title ? 'input-error' : ''}`}
                    {...register(`steps.${index}.title` as const)}
                  />
                  {errors.steps?.[index]?.title && (
                    <p className="form-error">{errors.steps[index]?.title?.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Mô tả bước (ít nhất 10 ký tự)</label>
                  <textarea
                    className={`textarea ${errors.steps?.[index]?.description ? 'input-error' : ''}`}
                    {...register(`steps.${index}.description` as const)}
                  />
                  {errors.steps?.[index]?.description && (
                    <p className="form-error">
                      {errors.steps[index]?.description?.message}
                    </p>
                  )}
                </div>

                <div className="max-w-xs">
                  <label className="form-label">Thời gian (phút, không bắt buộc)</label>
                  <input
                    type="number"
                    className={`input ${errors.steps?.[index]?.durationMinutes ? 'input-error' : ''}`}
                    {...register(`steps.${index}.durationMinutes` as const, {
                      setValueAs: (value) =>
                        value === '' || value === null ? undefined : Number(value),
                    })}
                  />
                  {errors.steps?.[index]?.durationMinutes && (
                    <p className="form-error">
                      {errors.steps[index]?.durationMinutes?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col justify-end gap-3 sm:flex-row">
        {mode === 'create' ? (
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={submitDraft}
              disabled={submitting}
            >
              Lưu nháp
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={submitPublish}
              disabled={submitting}
            >
              {submitting ? 'Đang lưu...' : 'Lưu và xuất bản'}
            </button>
          </>
        ) : (
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        )}
      </div>
    </form>
  );
}

