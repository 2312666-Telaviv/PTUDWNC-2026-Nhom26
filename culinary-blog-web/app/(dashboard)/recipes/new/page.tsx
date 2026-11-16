import { Metadata } from 'next';
import { RecipeForm } from '@/components/forms/RecipeForm';
import { getCategories } from '@/lib/api/categories';

export const metadata: Metadata = {
  title: 'Đăng công thức mới',
};

export default async function NewRecipePage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Đăng công thức mới</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <RecipeForm categories={categories} mode="create" />
      </div>
    </div>
  );
}
