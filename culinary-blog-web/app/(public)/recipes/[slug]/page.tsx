import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RecipeDetail } from '@/components/recipe/RecipeDetail';
import { CommentSection } from '@/components/recipe/CommentSection';
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

  return (
    <>
      <RecipeDetail recipe={recipe} />
      <CommentSection recipeId={recipe.id} />
    </>
  );
}
