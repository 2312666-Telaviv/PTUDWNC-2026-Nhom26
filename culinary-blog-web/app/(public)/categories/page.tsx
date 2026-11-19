import { getMockCategories } from '@/lib/mock/categories';
import { recipeApi } from '@/lib/api/server';
import Link from 'next/link';
import { CategoryDto } from '@/types/category';

export const revalidate = 3600;

export default async function CategoriesPage() {
  const categories: CategoryDto[] = getMockCategories();
  const result = await recipeApi.getList({ page: 1, pageSize: 1000 });
  const allRecipes = result.items;

  const categoriesWithCount = categories.map((category) => ({
    ...category,
    recipeCount: allRecipes.filter((r) => r.categoryName === category.name).length,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh mục món ăn</h1>
          <p className="mt-1 text-sm text-gray-600">
            Chọn một danh mục để xem các công thức thuộc nhóm đó.
          </p>
        </div>
        <Link
          href="/recipes"
          className="btn btn-outline"
        >
          Xem tất cả công thức
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesWithCount.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group block rounded-xl border border-orange-100 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-orange-200"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-600 font-bold text-xl group-hover:bg-orange-600 group-hover:text-white transition">
              {category.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900 group-hover:text-orange-600">
              {category.name}
            </h3>
            <p className="text-sm text-gray-600">
              {category.recipeCount} công thức
            </p>
          </Link>
        ))}
      </div>

      {categoriesWithCount.length === 0 && (
        <div className="rounded-lg border border-orange-100 bg-white p-8 text-center">
          <p className="text-gray-600">Chưa có danh mục nào.</p>
        </div>
      )}
    </div>
  );
}
