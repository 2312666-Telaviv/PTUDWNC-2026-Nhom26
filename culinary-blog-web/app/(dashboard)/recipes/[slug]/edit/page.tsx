import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { RecipeForm } from '@/components/forms/RecipeForm';
import { RecipeStatusBadge } from '@/components/recipe/RecipeStatusBadge';
import { RecipeStatusPanel } from '@/components/recipe/RecipeStatusPanel';
import { recipeToFormValues } from '@/lib/recipe-form';
import { getCategories } from '@/lib/api/categories';
import { canManageRecipe, getSessionActor } from '@/lib/api/route-auth';
import { recipeApi } from '@/lib/api/server';

interface EditRecipePageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: 'Chỉnh sửa công thức',
};

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { slug } = await params;
  const recipeId = /^\d+$/.test(slug) ? Number(slug) : NaN;

  if (!Number.isSafeInteger(recipeId) || recipeId <= 0) {
    notFound();
  }

  const actor = await getSessionActor();
  if (!actor) {
    redirect(`/login?callbackUrl=/recipes/${recipeId}/edit`);
  }

  const recipe = await recipeApi.getById(recipeId, { includeUnpublished: true });

  if (!canManageRecipe(actor, recipe)) {
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

  const categories = await getCategories();
  const initialValues = recipeToFormValues(recipe, categories);

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
          <RecipeStatusBadge status={recipe.status} />
          {recipe.status === 'Published' && (
            <Link href={`/recipes/${recipe.slug}`} className="btn btn-outline text-sm">
              Xem công khai
            </Link>
          )}
        </div>
      </div>

      <RecipeStatusPanel recipeId={recipe.id} status={recipe.status} />

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <RecipeForm
          categories={categories}
          mode="edit"
          recipeId={recipe.id}
          initialValues={initialValues}
          initialStatus={recipe.status}
        />
      </div>
    </div>
  );
}
