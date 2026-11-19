import { Metadata } from 'next';
import { Pagination } from '@/components/common/Pagination';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { recipeApi } from '@/lib/api/server';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Công thức nấu ăn',
  description: 'Khám phá các công thức nấu ăn truyền thống Việt Nam',
};

interface RecipesPagedPageProps {
  params: Promise<{
    page: string;
  }>;
}

export default async function RecipesPagedPage({ params }: RecipesPagedPageProps) {
  const { page: pageStr } = await params;
  const page = parseInt(pageStr, 10) || 1;

  const result = await recipeApi.getList({ page, pageSize: 12, status: 'Published' });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Công thức nấu ăn</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {result.items.map((recipe, index) => (
          <RecipeCard key={recipe.id} recipe={recipe} priority={index < 3} />
        ))}
      </div>

      {result.items.length === 0 && (
        <p className="py-8 text-center text-gray-500">Không tìm thấy công thức nào.</p>
      )}

      <Pagination
        currentPage={Number(result.page) || 1}
        totalPages={result.totalPages}
        getHref={(p) => (p === 1 ? '/recipes' : `/recipes/page/${p}`)}
      />
    </div>
  );
}
