import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RecipeForm } from '@/components/forms/RecipeForm';
import { getCategories } from '@/lib/api/categories';
import { getSessionActor } from '@/lib/api/route-auth';

export const metadata: Metadata = {
  title: 'Tạo công thức mới',
};

export default async function CreateRecipePage() {
  const actor = await getSessionActor();
  if (!actor) {
    redirect('/login?callbackUrl=%2Frecipes%2Fcreate');
  }

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Tạo công thức mới</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <RecipeForm categories={categories} mode="create" />
      </div>
    </div>
  );
}
