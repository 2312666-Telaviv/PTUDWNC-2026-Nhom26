<<<<<<< HEAD
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

=======
import { recipeService } from '@/lib/api/services';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import type { RecipeListDto } from '@/types/api';

export default async function RecipesListPage() {
  let recipes: RecipeListDto[] = [];
  try {
    const data = await recipeService.getList({ page: 1, pageSize: 10 });
    recipes = data.items;
  } catch {
    recipes = [];
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Danh sách công thức</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
        {recipes.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">
            Không có công thức nào.
          </p>
        )}
      </div>
    </div>
  );
}
>>>>>>> origin/2312665-KieuHaLinh
