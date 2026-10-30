import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMockCategories } from '@/lib/mock/categories';
import { getMockRecipes } from '@/lib/mock/recipes';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { slugify } from '@/lib/utils/slugify';

export const revalidate = 3600;

export async function generateStaticParams() {
  return getMockCategories().map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = getMockCategories().find(
    (item) => item.slug === slug || slugify(item.name) === slug
  );

  if (!category) {
    notFound();
  }

  const recipes = getMockRecipes().filter(
    (recipe) => recipe.categoryName === category.name || slugify(recipe.categoryName) === category.slug
  );

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
