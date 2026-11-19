import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { formatZodErrors } from '@/lib/api/validation';
import { canManageRecipe, getSessionActor } from '@/lib/api/route-auth';
import {
  getPublishedRecipeBySlug,
  getRecipeById,
  updateMockRecipe,
} from '@/lib/mock/recipe-store';
import { mockCategories } from '@/lib/mock/categories';
import { recipeRequestSchema } from '@/types/recipe';

export const runtime = 'nodejs';

interface RecipeRouteContext {
  params: Promise<{ id: string }>;
}

function parseRecipeId(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// GET: công khai chỉ trả về công thức đã Published.
// Hỗ trợ cả id (số) và slug để LikeButton/useRecipe có thể tải lại dữ liệu.
export async function GET(_request: Request, { params }: RecipeRouteContext) {
  const { id: idOrSlug } = await params;
  const id = parseRecipeId(idOrSlug);

  const recipe = id
    ? getRecipeById(id)
    : getPublishedRecipeBySlug(decodeURIComponent(idOrSlug));

  if (!recipe) {
    return NextResponse.json({ message: 'Không tìm thấy công thức.' }, { status: 404 });
  }

  return NextResponse.json(recipe);
}

export async function PUT(request: Request, { params }: RecipeRouteContext) {
  const { id: idParam } = await params;
  const id = parseRecipeId(idParam);

  if (!id) {
    return NextResponse.json({ message: 'Mã công thức không hợp lệ.' }, { status: 400 });
  }

  const actor = await getSessionActor();
  if (!actor) {
    return NextResponse.json(
      { message: 'Bạn cần đăng nhập để cập nhật công thức.' },
      { status: 401 }
    );
  }

  const existing = getRecipeById(id, { includeUnpublished: true });
  if (!existing) {
    return NextResponse.json({ message: 'Không tìm thấy công thức.' }, { status: 404 });
  }

  if (!canManageRecipe(actor, existing)) {
    return NextResponse.json(
      { message: 'Bạn không có quyền cập nhật công thức này.' },
      { status: 403 }
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

  const updated = updateMockRecipe(id, parsed.data);
  if (!updated) {
    return NextResponse.json({ message: 'Không tìm thấy công thức.' }, { status: 404 });
  }

  revalidatePath('/', 'layout');

  return NextResponse.json(updated);
}
