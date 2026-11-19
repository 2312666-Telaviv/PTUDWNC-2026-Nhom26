import type { Metadata } from 'next';
import { Pagination } from '@/components/common/Pagination';
import { RecipeGrid } from '@/components/recipe/RecipeGrid';
import { ViewModeToggle } from '@/components/recipe/ViewModeToggle';
import { recipeApi } from '@/lib/api/server';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Công thức nấu ăn',
  description: 'Khám phá các công thức nấu ăn truyền thống Việt Nam',
};

export default async function RecipesPage() {
  const result = await recipeApi.getList({ page: 1, pageSize: 12, status: 'Published' });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Công thức nấu ăn</h1>
          <p className="mt-1 text-sm text-gray-600">Danh sách công thức</p>
        </div>
        <ViewModeToggle />
      </div>

      <RecipeGrid recipes={result.items} />

      {result.items.length === 0 && (
        <p className="py-8 text-center text-gray-500">Không tìm thấy công thức nào.</p>
      )}

      <Pagination
        currentPage={Number(result.page) || 1}
        totalPages={result.totalPages}
        getHref={(page) => (page === 1 ? '/recipes' : `/recipes/page/${page}`)}
      />
    </div>
  );
}
