import { Metadata } from 'next';
import Link from 'next/link';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { recipeApi } from '@/lib/api/server';
import { getMockRecipes } from '@/lib/mock/recipes';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Công thức nấu ăn',
  description: 'Khám phá các công thức nấu ăn truyền thống Việt Nam',
};

export async function generateStaticParams() {
  const allRecipes = getMockRecipes();
  const totalCount = allRecipes.length;
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const params: { page: string }[] = [];
  for (let i = 2; i <= totalPages; i++) {
    params.push({ page: i.toString() });
  }
  return params;
}

interface RecipesPagedPageProps {
  params: Promise<{
    page: string;
  }>;
}

export default async function RecipesPagedPage({ params }: RecipesPagedPageProps) {
  const { page: pageStr } = await params;
  const page = parseInt(pageStr, 10) || 1;

  const result = await recipeApi.getList({ page, pageSize: 12, categoryId: null });

  const hasPrev = page > 1;
  const hasNext = page < result.totalPages;

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

      <div className="mt-8 flex items-center justify-center gap-4">
        {hasPrev && (
          <Link
            href={page === 2 ? '/recipes' : `/recipes/page/${page - 1}`}
            className="rounded-md border border-orange-300 px-4 py-2 text-orange-700 transition hover:bg-orange-50"
          >
            Trước
          </Link>
        )}
        {!hasPrev && (
          <span className="px-4 py-2 text-orange-700 opacity-50">Trước</span>
        )}
        <span className="text-sm text-gray-600">
          Trang {result.pageNumber} / {result.totalPages}
        </span>
        {hasNext && (
          <Link
            href={`/recipes/page/${page + 1}`}
            className="rounded-md border border-orange-300 px-4 py-2 text-orange-700 transition hover:bg-orange-50"
          >
            Sau
          </Link>
        )}
        {!hasNext && (
          <span className="px-4 py-2 text-orange-700 opacity-50">Sau</span>
        )}
      </div>
    </div>
  );
}
