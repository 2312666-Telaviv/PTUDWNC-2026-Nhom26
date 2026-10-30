import Link from 'next/link';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { recipeApi } from '@/lib/api/server';
import { RecipeListDto } from '@/types/api';
import { slugify } from '@/lib/utils/slugify';

interface LatestRecipesSectionProps {
  categorySlug?: string | null;
}

export async function LatestRecipesSection({ categorySlug }: LatestRecipesSectionProps) {
  let recipes: RecipeListDto[];

  try {
    recipes = await recipeApi.getLatest(12);
  } catch {
    return (
      <ErrorState
        title="Không tải được công thức"
        description="Danh sách công thức mới nhất đang gặp sự cố. Vui lòng thử lại."
      />
    );
  }

  // Lọc theo danh mục nếu có categorySlug (slugify categoryName để so khớp)
  const filteredRecipes = categorySlug
    ? recipes.filter((r) => slugify(r.categoryName) === categorySlug)
    : recipes;

  if (filteredRecipes.length === 0) {
    return (
      <EmptyState
        title={
          categorySlug
            ? `Chưa có công thức nào trong danh mục này`
            : 'Chưa có công thức nào'
        }
        description={
          categorySlug
            ? 'Hãy chọn một danh mục khác hoặc quay lại sau.'
            : 'Hãy quay lại sau để khám phá những công thức mới nhất.'
        }
        action={{ href: '/recipes', label: 'Xem trang công thức' }}
      />
    );
  }

  const heading = categorySlug
    ? `Công thức ${filteredRecipes[0]?.categoryName || 'mới nhất'}`
    : 'Công thức mới nhất';
  const subHeading = categorySlug
    ? `Những món ăn thuộc danh mục ${filteredRecipes[0]?.categoryName || ''}.`
    : 'Những món ăn vừa được chia sẻ bởi cộng đồng yêu bếp.';

  return (
    <section aria-labelledby="latest-recipes-heading">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="latest-recipes-heading" className="text-2xl font-bold text-gray-900">
            {heading}
          </h2>
          <p className="mt-1 text-sm text-gray-600">{subHeading}</p>
        </div>
        {!categorySlug && (
          <Link
            href="/recipes"
            className="text-sm font-medium text-orange-600 transition hover:text-orange-700"
          >
            Xem tất cả →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filteredRecipes.map((recipe, index) => (
          <RecipeCard key={recipe.id} recipe={recipe} priority={index < 3} />
        ))}
      </div>

      {!categorySlug && (
        <div className="mt-8 text-center">
          <Link href="/recipes" className="btn btn-outline">
            Xem thêm công thức
          </Link>
        </div>
      )}
    </section>
  );
}
