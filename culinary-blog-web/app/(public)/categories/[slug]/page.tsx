import { getMockRecipes } from '@/lib/mock/recipes';

export const revalidate = 3600;

export async function generateStaticParams() {
  const allRecipes = getMockRecipes();
  const categories = Array.from(new Set(allRecipes.map((r) => r.categoryName)));
  return categories.map((c) => ({
    slug: c.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export default function CategoryPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Danh mục công thức</h1>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
        Danh mục công thức (ISR)
      </div>
    </div>
  );
}
