import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { RecipeForm } from '@/components/forms/RecipeForm';
import { RecipeStatusBadge } from '@/components/recipe/RecipeStatusBadge';
import { RecipeStatusPanel } from '@/components/recipe/RecipeStatusPanel';
import { recipeToFormValues } from '@/lib/recipe-form';
import { getCategories } from '@/lib/api/categories';
import { canManageRecipe, getSessionActor } from '@/lib/api/route-auth';
import { recipeApi } from '@/lib/api/server';
import type { RecipeDto } from '@/types/api';

interface EditRecipePageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: 'Chỉnh sửa công thức',
};

function LoadingState() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 text-center text-sm text-gray-500">
      Đang tải công thức...
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold text-red-600">Không tìm thấy công thức</h1>
      <p className="mt-2 text-sm text-gray-600">
        Công thức có thể đã bị xóa hoặc chưa được xuất bản.
      </p>
      <Link href="/recipes/manage" className="btn btn-outline mt-6">
        Về trang quản lý
      </Link>
    </div>
  );
}

function ForbiddenState() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-bold text-red-800">Không có quyền truy cập</h1>
        <p className="mt-2 text-sm text-red-700">
          Bạn chỉ có thể chỉnh sửa công thức do mình tạo hoặc cần quyền Admin.
        </p>
        <Link href="/dashboard" className="btn btn-outline mt-4">
          Quay lại trang tổng quan
        </Link>
      </div>
    </div>
  );
}

async function EditRecipeContent({ slug }: { slug: string }) {
  let recipe: RecipeDto | undefined;

  const recipeId = /^\d+$/.test(slug) ? Number(slug) : NaN;
  if (Number.isSafeInteger(recipeId) && recipeId > 0) {
    try {
      recipe = await recipeApi.getById(recipeId);
    } catch {
      recipe = undefined;
    }
  }

  if (!recipe) {
    try {
      recipe = await recipeApi.getBySlug(slug);
    } catch {
      recipe = undefined;
    }
  }

  if (!recipe) {
    return <NotFoundState />;
  }

  const actor = await getSessionActor();
  if (!actor) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/recipes/${slug}/edit`)}`);
  }

  if (!canManageRecipe(actor, { authorId: recipe.authorId ?? '' })) {
    return <ForbiddenState />;
  }

  const categories = await getCategories();
  const initialValues = recipeToFormValues(recipe, categories);
  const status = recipe.status ?? 'Draft';

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-orange-600 transition hover:text-orange-700"
          >
            ← Trang tổng quan
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Chỉnh sửa công thức</h1>
          <p className="mt-1 text-sm text-gray-600">{recipe.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <RecipeStatusBadge status={status} />
          {status === 'Published' && (
            <Link href={`/recipes/${recipe.slug}`} className="btn btn-outline text-sm">
              Xem công khai
            </Link>
          )}
        </div>
      </div>

      {status !== 'Published' && (
        <div
          role="status"
          className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          Công thức đang ở trạng thái {status}; chỉ công thức đã xuất bản mới hiển thị công khai.
        </div>
      )}

      <RecipeStatusPanel recipeId={recipe.id} status={status} />

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <RecipeForm
          categories={categories}
          mode="edit"
          recipeId={recipe.id}
          initialValues={initialValues}
          initialStatus={status}
        />
      </div>
    </div>
  );
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<LoadingState />}>
      <EditRecipeContent slug={slug} />
    </Suspense>
  );
}
