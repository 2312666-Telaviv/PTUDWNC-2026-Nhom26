import { notFound } from 'next/navigation';
import Link from 'next/link';
import { categoryApi, recipeApi } from '@/lib/api/server';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { EmptyState } from '@/components/ui/EmptyState';

export const revalidate = 3600;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categories = await categoryApi.getList();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const result = await recipeApi.getList({
    page: 1,
    pageSize: 100,
    status: 'Published',
    categoryName: category.name,
  });
  const recipes = result.items;

  return (
    <div className="min-h-screen bg-orange-50/30">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 transition hover:text-orange-700"
            >
              ← Tất cả danh mục
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">{category.name}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {recipes.length > 0
                ? `${recipes.length} công thức trong danh mục này`
                : 'Danh mục này hiện chưa có công thức nào'}
            </p>
          </div>
          <Link href="/recipes" className="btn btn-outline shrink-0">
            Xem tất cả công thức
          </Link>
        </div>

        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} priority={index < 3} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Chưa có công thức nào"
            description={`Hiện chưa có công thức trong danh mục ${category.name}.`}
            action={{ href: '/categories', label: 'Quay lại danh sách danh mục' }}
          />
        )}
      </div>
    </div>
  );
}
