import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { CategorySidebar } from '@/components/home/CategorySidebar';
import { CategorySidebarSkeleton } from '@/components/home/CategorySidebarSkeleton';
import { LatestRecipesSection } from '@/components/home/LatestRecipesSection';
import { LatestRecipesSkeleton } from '@/components/home/LatestRecipesSkeleton';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Trang chủ',
  description: 'Khám phá công thức nấu ăn Việt Nam mới nhất, theo danh mục và chia sẻ từ cộng đồng.',
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedCategory =
    typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;

  return (
    <div className="bg-orange-50/30">
      <section className="border-b border-orange-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-16 lg:py-24">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange-600">
              Culinary Blog
            </p>
            <h1 className="mb-4 max-w-2xl text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              Khám phá hương vị ẩm thực Việt Nam
            </h1>
            <p className="mb-6 max-w-xl text-lg text-gray-600">
              Nơi chia sẻ những món ăn truyền thống, bí quyết nấu nướng và hương vị đậm đà của ẩm
              thực Việt Nam. Từ món ăn gia đình đến món ăn dân tộc, mọi công thức đều được chia sẻ
              với tinh thần yêu bếp và yêu đời.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/recipes" className="btn btn-primary">
                Xem tất cả công thức
              </Link>
              <Link href="/categories" className="btn btn-outline">
                Duyệt theo danh mục
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[260px_1fr] lg:items-start">
        <aside className="order-2 lg:order-1" aria-label="Danh mục công thức">
          <Suspense fallback={<CategorySidebarSkeleton />}>
            <CategorySidebar selectedSlug={selectedCategory} />
          </Suspense>
        </aside>

        <div className="order-1 min-w-0 lg:order-2">
          <Suspense fallback={<LatestRecipesSkeleton />}>
            <LatestRecipesSection categorySlug={selectedCategory} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
