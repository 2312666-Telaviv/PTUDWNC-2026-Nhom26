import { Metadata } from 'next';
import { Pagination } from '@/components/common/Pagination';
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

           <Pagination
        currentPage={result.pageNumber}
        totalPages={result.totalPages}
        getHref={(page) => (page === 1 ? '/recipes' : `/recipes/page/${page}`)}
      />
    </div>
  );
}

