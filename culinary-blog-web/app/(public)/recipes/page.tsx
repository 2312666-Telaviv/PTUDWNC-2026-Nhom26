import { recipeApi } from '@/lib/api/server';
import { RecipeCard } from '@/components/recipe/RecipeCard';

// ISR: làm mới trang tối đa 1 lần mỗi 3600 giây (1 giờ)
export const revalidate = 3600;

export default async function RecipesPage() {
  const result = await recipeApi.getList({ page: 1, pageSize: 12 });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Công thức nấu ăn</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {result.items.map((recipe, index) => (
          <RecipeCard key={recipe.id} recipe={recipe} priority={index < 3} />
        ))}
      </div>
    </main>
  );
}