import { recipeService } from '@/lib/api/services';

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let recipe;
  try {
    recipe = await recipeService.getBySlug(slug);
  } catch {
    recipe = null;
  }

  if (!recipe) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-semibold text-red-600">Không tìm thấy công thức</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
      <p className="text-muted-foreground mb-6">{recipe.description}</p>
    </div>
  );
}
