import { Metadata } from 'next';
import Link from 'next/link';
import { RecipeGrid } from '@/components/recipe/RecipeGrid';
import { ViewModeToggle } from '@/components/recipe/ViewModeToggle';
import { recipeApi } from '@/lib/api/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Công thức nấu ăn',
  description: 'Khám phá các công thức nấu ăn truyền thống Việt Nam',
};

export default async function RecipesPage() {
  const result = await recipeApi.getList({ page: 1, pageSize: 12, categoryId: null });

  const hasNext = result.totalPages > 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Công thức nấu ăn</h1>
        <ViewModeToggle />
      </div>

      <RecipeGrid recipes={result.items} />

      {result.items.length === 0 && (
        <p className="py-8 text-center text-gray-500">Không tìm thấy công thức nào.</p>
      )}

      <div className="mt-8 flex items-center justify-center gap-4">
        <span className="px-4 py-2 text-orange-700 opacity-50">Trước</span>
        <span className="text-sm text-gray-600">
          Trang {result.pageNumber} / {result.totalPages}
        </span>
        {hasNext && (
          <Link
            href="/recipes/page/2"
            className="rounded-md border border-orange-300 px-4 py-2 text-orange-700 transition hover:bg-orange-50"
          >
            Sau
          </Link>
        )}
      </div>
    </div>
  );
}
