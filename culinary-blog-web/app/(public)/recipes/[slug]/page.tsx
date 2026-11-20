import Image from 'next/image';
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

  const imageUrl = recipe.imageUrl ?? recipe.primaryImageUrl;

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
      <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Ảnh công thức: ${recipe.title}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl" aria-hidden>
            🍽️
          </div>
        )}
      </div>
      <p className="text-muted-foreground mb-6">{recipe.description}</p>
    </div>
  );
}
