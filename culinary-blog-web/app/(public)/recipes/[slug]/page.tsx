import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { recipeApi } from '@/lib/api/server';
import { RecipeDetail } from '@/components/recipe/RecipeDetail';

// SSR: luôn render mới ở mỗi request
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

// getBySlug ném lỗi khi không thấy, nên bọc lại để trả về null
async function getRecipe(slug: string) {
  try {
    return await recipeApi.getBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; // Next 15: params là Promise
  const recipe = await getRecipe(slug);

  if (!recipe) return { title: 'Không tìm thấy công thức' };

  return {
    title: `${recipe.title} | Culinary Blog`,
    description: recipe.description,
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      type: 'article',
      images: recipe.primaryImageUrl
        ? [{ url: recipe.primaryImageUrl, width: 800, height: 450 }]
        : [],
    },
  };
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);

  if (!recipe) notFound(); // hiện trang not-found.tsx

  return <RecipeDetail recipe={recipe} />;
}