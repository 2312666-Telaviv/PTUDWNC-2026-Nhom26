import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminCategory, CategoryManager } from '@/components/admin/CategoryManager';
import { mockRecipes } from '@/lib/mock/recipes';
import { toSlug } from '@/lib/utils/slug';

export const metadata: Metadata = {
  title: 'Quản lý danh mục',
};

export default async function AdminCategoriesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.roles?.includes('Admin')) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          Bạn không có quyền xem trang này. Chỉ Quản trị viên mới truy cập được.
        </div>
      </div>
    );
  }

  const counts = new Map<string, number>();
  mockRecipes.forEach((recipe) => {
    counts.set(recipe.categoryName, (counts.get(recipe.categoryName) ?? 0) + 1);
  });

  const initialCategories: AdminCategory[] = Array.from(counts, ([name, recipeCount]) => ({
    id: `c-${toSlug(name)}`,
    name,
    slug: toSlug(name),
    description: '',
    recipeCount,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
      <p className="mb-6 text-sm text-gray-600">
        Dữ liệu mẫu, thay đổi chỉ lưu trong phiên xem này cho tới khi backend có API danh mục.
      </p>
      <CategoryManager initialCategories={initialCategories} />
    </div>
  );
}
