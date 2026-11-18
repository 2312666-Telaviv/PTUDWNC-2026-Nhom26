import { Metadata } from 'next';
import Link from 'next/link';
import { mockRecipes } from '@/lib/mock/recipes';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Danh mục công thức',
  description: 'Xem tất cả danh mục công thức nấu ăn Việt Nam',
};

// Cùng cách tạo slug với app/(public)/categories/[slug]/page.tsx
function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default function CategoriesPage() {
  const counts = new Map<string, number>();
  mockRecipes.forEach((recipe) => {
    counts.set(recipe.categoryName, (counts.get(recipe.categoryName) ?? 0) + 1);
  });

  const categories = Array.from(counts, ([name, count]) => ({
    name,
    count,
    slug: toSlug(name),
  })).sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Tất cả danh mục</h1>

      {categories.length === 0 ? (
        <p className="py-8 text-center text-gray-500">Chưa có danh mục nào.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/categories/${category.slug}`}
                className="block rounded-lg border border-orange-100 bg-white p-6 transition hover:border-orange-300 hover:shadow-md"
              >
                <h2 className="text-xl font-semibold text-orange-700">{category.name}</h2>
                <p className="mt-1 text-sm text-gray-600">{category.count} công thức</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}