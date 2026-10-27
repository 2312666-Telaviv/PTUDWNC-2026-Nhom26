import { recipeService } from '@/lib/api/services';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import type { RecipeListDto } from '@/types/api';

export default async function RecipesListPage() {
  let recipes: RecipeListDto[] = [];
  try {
    const data = await recipeService.getList({ page: 1, pageSize: 10 });
    recipes = data.items;
  } catch {
    recipes = [];
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Danh sách công thức</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
        {recipes.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">
            Không có công thức nào.
          </p>
        )}
      </div>
    </div>
  );
}
