import Link from 'next/link';
import { ChefHat, Plus, Sparkles } from 'lucide-react';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { recipeApi } from '@/lib/api/server';
import { RecipeListDto } from '@/types/api';
import { slugify } from '@/lib/utils/slugify';

interface LatestRecipesSectionProps {
  categorySlug?: string | null;
}

export async function LatestRecipesSection({ categorySlug }: LatestRecipesSectionProps) {
  let recipes: RecipeListDto[];

  let suggestions: RecipeListDto[] = [];

  try {
    const published = (
      await recipeApi.getList({
        page: 1,
        pageSize: 100,
        status: 'Published',
        includeSystemSeed: Boolean(categorySlug),
      })
    ).items;
    const byLatest = [...published].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const byTrending = [...published].sort(
      (a, b) =>
        (b.likeCount ?? 0) - (a.likeCount ?? 0) ||
        (b.viewCount ?? 0) - (a.viewCount ?? 0) ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    recipes = categorySlug ? byTrending : byLatest.slice(0, 12);
    suggestions = categorySlug
      ? byTrending.filter((r) => slugify(r.categoryName) !== categorySlug).slice(0, 4)
      : [];
  } catch {
    return (
      <ErrorState
        title="Không tải được công thức"
        description="Danh sách công thức mới nhất đang gặp sự cố. Vui lòng thử lại."
      />
    );
  }

  const filteredRecipes = categorySlug
    ? recipes.filter((r) => slugify(r.categoryName) === categorySlug).slice(0, 12)
    : recipes;

  if (filteredRecipes.length === 0) {
    return (
      <section aria-labelledby="latest-recipes-heading">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#EA580C]">
            Từ bếp cộng đồng
          </p>
          <h2 id="latest-recipes-heading" className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            {categorySlug ? 'Góc thịnh hành của danh mục này' : 'Công thức mới nhất'}
          </h2>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-amber-50 to-white p-8 text-center shadow-sm sm:p-12">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-orange-200/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-52 w-52 rounded-full bg-amber-200/50 blur-3xl" />
          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm ring-1 ring-orange-100">
              <ChefHat className="h-8 w-8" strokeWidth={1.8} />
            </div>
            <h3 className="mx-auto mt-5 max-w-2xl text-lg font-bold leading-snug text-gray-900 sm:text-xl">
              Chưa có công thức nào cho mục này — hãy là người đầu tiên chia sẻ món ngon của bạn!
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-600">
              Mỗi món ăn đều bắt đầu từ một câu chuyện. Chia sẻ bí quyết nhỏ của bạn để góc này
              thêm ấm áp và đầy hương vị hơn.
            </p>
            <Link
              href="/recipes/create"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#EA580C] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              Đăng công thức ngay
            </Link>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <h3 className="text-base font-bold text-gray-900">Có thể bạn sẽ thích</h3>
              <span className="text-sm text-gray-500">từ các danh mục khác</span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {suggestions.map((recipe, index) => (
                <RecipeCard key={recipe.id} recipe={recipe} priority={index < 2} />
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  const heading = categorySlug
    ? `Món thịnh hành · ${filteredRecipes[0]?.categoryName || 'danh mục này'}`
    : 'Công thức mới nhất';
  const subHeading = categorySlug
    ? 'Xếp theo lượt thích và lượt xem cao nhất trong danh mục này.'
    : 'Những món ăn vừa được chia sẻ bởi cộng đồng yêu bếp.';

  return (
    <section aria-labelledby="latest-recipes-heading">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#EA580C]">
            Từ bếp cộng đồng
          </p>
          <h2 id="latest-recipes-heading" className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            {heading}
          </h2>
          <p className="mt-1 text-sm text-gray-600">{subHeading}</p>
        </div>
        {!categorySlug && (
          <Link
            href="/recipes"
            className="inline-flex items-center rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm transition-all hover:border-orange-400 hover:shadow-md"
          >
            Xem tất cả →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRecipes.map((recipe, index) => (
          <RecipeCard key={recipe.id} recipe={recipe} priority={index < 3} />
        ))}
      </div>

      {!categorySlug && (
        <div className="mt-10 text-center">
          <Link
            href="/recipes"
            className="inline-flex items-center rounded-2xl bg-orange-50 px-6 py-3 text-sm font-semibold text-orange-700 transition-all hover:bg-orange-100 hover:shadow-sm"
          >
            Xem thêm công thức
          </Link>
        </div>
      )}
    </section>
  );
}
