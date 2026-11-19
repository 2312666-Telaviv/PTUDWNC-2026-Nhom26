<<<<<<< HEAD
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RecipeDetail } from '@/components/recipe/RecipeDetail';
import { CommentSection } from '@/components/recipe/CommentSection';
import { canManageRecipe, getSessionActor } from '@/lib/api/route-auth';
import { recipeApi } from '@/lib/api/server';

interface RecipeDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: RecipeDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const recipe = await recipeApi.getBySlug(slug);

    return {
      title: recipe.title,
      description: recipe.description,
      openGraph: {
        title: recipe.title,
        description: recipe.description,
        images: recipe.primaryImageUrl ? [recipe.primaryImageUrl] : undefined,
        locale: 'vi_VN',
        type: 'article',
      },
    };
  } catch {
    return {
      title: 'Công thức',
    };
  }
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { slug } = await params;
  let recipe;

  try {
    recipe = await recipeApi.getBySlug(slug);
  } catch {
    notFound();
  }

  if (!recipe) {
    notFound();
  }

  const actor = await getSessionActor();
  const canEdit = actor ? canManageRecipe(actor, recipe) : false;

  return (
    <>
      <RecipeDetail recipe={recipe} canEdit={canEdit} />
      <CommentSection recipeId={recipe.id} />
    </>
=======
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
>>>>>>> origin/2312665-KieuHaLinh
  );
}
