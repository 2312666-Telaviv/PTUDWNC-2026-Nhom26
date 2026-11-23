import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { LatestRecipesSection } from '@/components/home/LatestRecipesSection';
import { LatestRecipesSkeleton } from '@/components/home/LatestRecipesSkeleton';
import { TrendingCategories } from '@/components/home/TrendingCategories';
import { TrendingCategoriesSkeleton } from '@/components/home/TrendingCategoriesSkeleton';

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
    <div className="bg-[#FAF8F5]">
      <section className="relative overflow-hidden bg-[#FFF7ED]">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
              <Sparkles className="h-3.5 w-3.5" />
              Culinary Blog · Yêu bếp yêu đời
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Khám phá hương vị{' '}
              <span className="text-[#EA580C]">ẩm thực Việt Nam</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Từ bát phở nóng hổi đến món tráng miệng ngọt ngào. Tìm cảm hứng nấu ăn mỗi ngày từ
              những công thức được chia sẻ bởi cộng đồng yêu bếp Việt.
            </p>

            <form
              action="/recipes/search"
              method="get"
              className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="hero-search" className="sr-only">
                Tìm kiếm công thức
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-500" />
                <input
                  id="hero-search"
                  type="search"
                  name="q"
                  placeholder="Tìm món bạn yêu thích..."
                  className="h-12 w-full rounded-2xl border border-orange-100 bg-white pl-12 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <button
                type="submit"
                className="h-12 shrink-0 rounded-2xl bg-[#EA580C] px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-700 hover:shadow-md"
              >
                Tìm kiếm
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/recipes"
                className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md"
              >
                Xem tất cả công thức
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center rounded-2xl border border-orange-200 bg-white px-6 py-3 text-sm font-semibold text-orange-700 shadow-sm transition-all hover:border-orange-400 hover:shadow-md"
              >
                Duyệt theo danh mục
              </Link>
            </div>
          </div>

          <div className="relative">
            <HeroCarousel />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16" aria-labelledby="trending-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Trending
            </p>
            <h2 id="trending-heading" className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              Danh mục thịnh hành
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Khám phá những món ăn được yêu thích nhất theo từng nhóm — chọn danh mục để xem các
              công thức nấu nhiều, được thích nhiều nhất.
            </p>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 transition hover:text-orange-700"
          >
            Tất cả danh mục <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Suspense fallback={<TrendingCategoriesSkeleton />}>
          <TrendingCategories selectedSlug={selectedCategory} />
        </Suspense>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <Suspense fallback={<LatestRecipesSkeleton />}>
            <LatestRecipesSection categorySlug={selectedCategory} />
          </Suspense>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#EA580C] to-amber-500 px-6 py-10 text-white shadow-sm sm:px-12 sm:py-14">
          <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-100">
                Chia sẻ yêu bếp
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Chia sẻ công thức nấu ăn của riêng bạn với cộng đồng
              </h2>
              <p className="mt-2 text-sm text-orange-50">
                Mỗi công thức là một câu chuyện. Ghi lại bí quyết nhỏ của bạn để ai đó cũng có thể
                nấu nên bữa cơm thật ngon.
              </p>
            </div>
            <Link
              href="/recipes/create"
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-[#EA580C] shadow-sm transition-all hover:shadow-md"
            >
              Đăng công thức mới
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
