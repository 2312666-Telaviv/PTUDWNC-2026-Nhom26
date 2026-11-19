import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CakeSlice,
  ChefHat,
  Coffee,
  Cookie,
  Flame,
  Salad,
  Search,
  Soup,
  Sparkles,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import { categoryApi, recipeApi } from '@/lib/api/server';
import type { CategoryDto } from '@/types/category';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Khám phá danh mục món ăn',
  description: 'Tìm cảm hứng nấu ăn theo từng nhóm món Việt Nam.',
};

interface CategoriesPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

const iconBySlug: Record<string, LucideIcon> = {
  'mon-chinh': Utensils,
  'mon-khai-vi': Salad,
  'mon-canh-sup': Soup,
  'mon-xao-kho': Flame,
  'mon-an-vat': Cookie,
  'mon-chay': Salad,
  'trang-mieng-banh': CakeSlice,
  'do-uong': Coffee,
};

const iconByKeyword: Array<[string, LucideIcon]> = [
  ['canh', Soup],
  ['sup', Soup],
  ['xao', Flame],
  ['kho', Flame],
  ['banh', CakeSlice],
  ['ngot', CakeSlice],
  ['trang mieng', CakeSlice],
  ['uong', Coffee],
  ['tra', Coffee],
  ['cafe', Coffee],
  ['chay', Salad],
  ['rau', Salad],
  ['khai vi', Salad],
  ['vat', Cookie],
  ['snack', Cookie],
];

const descriptionBySlug: Record<string, string> = {
  'mon-chinh': 'Cơm, thịt, cá và món chính đưa cơm mỗi ngày.',
  'mon-khai-vi': 'Món nhỏ đầu bữa, mở vị giác nhẹ nhàng.',
  'mon-canh-sup': 'Âm ấm bát canh, tươi mới từng thìa súp.',
  'mon-xao-kho': 'Xào nhanh, kho kỹ, đậm đà hương vị cơm nhà.',
  'mon-an-vat': 'Những món vặt vui miệng, chế biến thật gọn.',
  'mon-chay': 'Rau củ, đậu phụ và hương vị thanh nhẹ.',
  'trang-mieng-banh': 'Bánh ngọt, chè và món tráng miệng dịu dàng.',
  'do-uong': 'Trà, cà phê, nước giải khát tự pha tại nhà.',
};

const fallbackDescription = 'Gợi ý công thức chọn lọc cho bữa ăn thêm phong phú.';

function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

function getCategoryIcon(category: CategoryDto): LucideIcon {
  if (iconBySlug[category.slug]) return iconBySlug[category.slug];

  const name = fold(category.name);
  const slug = fold(category.slug);
  const matched = iconByKeyword.find(([keyword]) => name.includes(keyword) || slug.includes(keyword));
  return matched?.[1] ?? ChefHat;
}

function getCategoryDescription(category: CategoryDto): string {
  return descriptionBySlug[category.slug] ?? fallbackDescription;
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = rawQuery?.trim() ?? '';
  const foldedQuery = fold(query);

  const [categories, result] = await Promise.all([
    categoryApi.getList(),
    recipeApi.getList({ page: 1, pageSize: 100, status: 'Published' }),
  ]);

  const categoriesWithCount = categories.map((category) => ({
    ...category,
    recipeCount: result.items.filter((recipe) => recipe.categoryName === category.name).length,
  }));

  const filteredCategories = foldedQuery
    ? categoriesWithCount.filter(
        (category) =>
          fold(category.name).includes(foldedQuery) || fold(category.slug).includes(foldedQuery)
      )
    : categoriesWithCount;

  const totalRecipes = categoriesWithCount.reduce((sum, category) => sum + category.recipeCount, 0);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <section className="relative overflow-hidden border-b border-orange-100/70 bg-white/60">
        <div className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
                <Sparkles className="h-3.5 w-3.5" />
                Cẩm nang ẩm thực
              </span>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Khám phá theo <span className="text-[#EA580C]">danh mục</span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600">
                Từ bát canh nóng hổi đến miếng bánh ngọt ngào. Chọn một nhóm món yêu thích để tìm
                ngay công thức phù hợp cho bữa cơm hôm nay.
              </p>

              <Link
                href="/recipes"
                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#EA580C] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-700"
              >
                Xem tất cả công thức
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">
              <form action="/categories" method="get" className="w-full max-w-md">
                <label htmlFor="category-search" className="sr-only">
                  Tìm kiếm danh mục
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-500" />
                  <input
                    id="category-search"
                    name="q"
                    type="search"
                    defaultValue={query}
                    placeholder="Tìm danh mục: món chính, tráng miệng..."
                    className="h-14 w-full rounded-2xl border border-orange-100 bg-white pl-12 pr-24 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 h-10 rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700"
                  >
                    Tìm
                  </button>
                </div>
              </form>

              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 lg:justify-end">
                <span className="rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-orange-100">
                  {categories.length} danh mục
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-orange-100">
                  {totalRecipes} công thức đã xuất bản
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Danh mục</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {query ? `Kết quả cho “${query}”` : 'Chọn một danh mục bạn yêu thích'}
            </h2>
          </div>
          {query && (
            <Link href="/categories" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
              Xóa tìm kiếm
            </Link>
          )}
        </div>

        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((category) => {
              const Icon = getCategoryIcon(category);

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100"
                >
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-orange-100/80 to-amber-50 blur-2xl transition-transform duration-500 group-hover:scale-125" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 text-orange-600 ring-1 ring-orange-100 transition-colors duration-300 group-hover:from-orange-500 group-hover:to-amber-500 group-hover:text-white">
                      <Icon className="h-8 w-8" strokeWidth={1.8} />
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        category.recipeCount > 0
                          ? 'bg-orange-50 text-orange-700 ring-orange-100'
                          : 'bg-gray-50 text-gray-500 ring-gray-100'
                      }`}
                    >
                      {category.recipeCount > 0
                        ? `${category.recipeCount} công thức`
                        : 'Chưa có công thức'}
                    </span>
                  </div>

                  <h3 className="relative mt-5 text-lg font-bold text-gray-900 transition-colors group-hover:text-orange-700">
                    {category.name}
                  </h3>

                  <p className="relative mt-2 flex-1 text-sm leading-relaxed text-gray-600">
                    {getCategoryDescription(category)}
                  </p>

                  <span className="relative mt-5 inline-flex items-center gap-1 text-sm font-semibold text-orange-600 opacity-100 transition-all duration-300 sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                    Khám phá ngay
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-orange-200 bg-white/70 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <Search className="h-7 w-7" />
            </div>
            <p className="mt-4 text-base font-semibold text-gray-900">
              {categories.length === 0 ? 'Chưa có danh mục nào' : 'Không tìm thấy danh mục phù hợp'}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {categories.length === 0
                ? 'Các danh mục công thức sẽ xuất hiện tại đây.'
                : 'Thử một từ khóa khác hoặc xem toàn bộ danh mục.'}
            </p>
            {categories.length > 0 && (
              <Link href="/categories" className="btn btn-outline mt-5">
                Xem tất cả danh mục
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
