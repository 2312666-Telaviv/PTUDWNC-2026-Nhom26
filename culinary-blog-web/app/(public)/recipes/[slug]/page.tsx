import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RecipeDetail } from '@/components/recipe/RecipeDetail';
import { CommentSection } from '@/components/recipe/CommentSection';
import { canManageRecipe, getSessionActor } from '@/lib/api/route-auth';
import { recipeApi } from '@/lib/api/server';
import { recipeService } from '@/lib/api/services';
import type { RecipeDto } from '@/types/api';

interface RecipeDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Ưu tiên nguồn server (fetch trực tiếp + mock an toàn), sau đó thử axios service
// của nhánh client trước khi trả về notFound.
async function loadRecipe(slug: string): Promise<RecipeDto | null> {
  try {
    return await recipeApi.getBySlug(slug);
  } catch {
    try {
      return await recipeService.getBySlug(slug);
    } catch {
      return null;
    }
  }
}

export async function generateMetadata({ params }: RecipeDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const recipe = await loadRecipe(slug);
    if (!recipe) {
      return { title: 'Công thức' };
    }

    const imageUrl = recipe.primaryImageUrl || recipe.imageUrl;
    return {
      title: recipe.title,
      description: recipe.description,
      openGraph: {
        title: recipe.title,
        description: recipe.description,
        images: imageUrl ? [imageUrl] : undefined,
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
  const recipe = await loadRecipe(slug);

  if (!recipe) {
    notFound();
  }

  const actor = await getSessionActor();
  const canEdit = actor ? canManageRecipe(actor, { authorId: recipe.authorId ?? '' }) : false;

  // RecipeDetail dùng primaryImageUrl; map thêm imageUrl từ nhánh client để không mất ảnh.
  const detailRecipe: RecipeDto = {
    ...recipe,
    primaryImageUrl: recipe.primaryImageUrl || recipe.imageUrl,
  };

  return (
    <>
      <RecipeDetail recipe={detailRecipe} canEdit={canEdit} />
      <CommentSection recipeId={recipe.id} />
    </>
  );
}
