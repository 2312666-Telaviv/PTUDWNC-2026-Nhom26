import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loading } from '@/components/common/Loading';
import { RecipeSearch } from '@/components/recipe/RecipeSearch';

export const metadata: Metadata = {
  title: 'Tìm kiếm công thức',
  description: 'Tìm công thức nấu ăn theo tên món, nguyên liệu hoặc danh mục',
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Tìm kiếm công thức</h1>
      <Suspense fallback={<Loading />}>
        <RecipeSearch />
      </Suspense>
    </div>
  );
}