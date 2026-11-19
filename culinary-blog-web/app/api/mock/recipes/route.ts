import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { formatZodErrors } from '@/lib/api/validation';
import { getSessionActor } from '@/lib/api/route-auth';
import {
  createMockRecipe,
  listPublishedRecipes,
  paginateRecipeList,
} from '@/lib/mock/recipe-store';
import { mockCategories } from '@/lib/mock/categories';
import { recipeRequestSchema } from '@/types/recipe';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get('pageSize') ?? '12') || 12)
  );
  const categoryIdParam = searchParams.get('categoryId');
  const categoryId = categoryIdParam ? Number(categoryIdParam) : null;

  const recipes = listPublishedRecipes({
    categoryId: Number.isFinite(categoryId) ? categoryId : null,
  });

  return NextResponse.json(paginateRecipeList(recipes, page, pageSize));
}

export async function POST(request: Request) {
  const actor = await getSessionActor();
  if (!actor) {
    return NextResponse.json(
      { message: 'Bạn cần đăng nhập để tạo công thức.' },
      { status: 401 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 });
  }

  const parsed = recipeRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Dữ liệu công thức không hợp lệ.',
        errors: formatZodErrors(parsed.error),
      },
      { status: 422 }
    );
  }

  const categoryExists = mockCategories.some(
    (category) => category.id === parsed.data.categoryId
  );
  if (!categoryExists) {
    return NextResponse.json(
      {
        message: 'Danh mục không tồn tại.',
        errors: { categoryId: 'Danh mục không tồn tại.' },
      },
      { status: 422 }
    );
  }

  const recipe = createMockRecipe(parsed.data, actor);
  revalidatePath('/', 'layout');

  return NextResponse.json(
    {
      id: recipe.id,
      slug: recipe.slug,
      title: recipe.title,
      status: recipe.status,
    },
    { status: 201 }
  );
}
