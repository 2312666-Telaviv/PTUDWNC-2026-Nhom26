import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { canManageRecipe, getSessionActor } from '@/lib/api/route-auth';
import {
  getRecipeById,
  updateMockRecipeStatus,
} from '@/lib/mock/recipe-store';
import {
  canTransitionRecipeStatus,
  RECIPE_STATUS_LABELS,
  RECIPE_STATUS_TRANSITIONS,
} from '@/lib/recipe-status';
import { recipeStatusSchema } from '@/types/recipe';

export const runtime = 'nodejs';

interface RecipeStatusRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RecipeStatusRouteContext) {
  const { id: idParam } = await params;
  const id = /^\d+$/.test(idParam) ? Number(idParam) : NaN;

  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ message: 'Mã công thức không hợp lệ.' }, { status: 400 });
  }

  const actor = await getSessionActor();
  if (!actor) {
    return NextResponse.json(
      { message: 'Bạn cần đăng nhập để đổi trạng thái công thức.' },
      { status: 401 }
    );
  }

  const existing = getRecipeById(id, { includeUnpublished: true });
  if (!existing) {
    return NextResponse.json({ message: 'Không tìm thấy công thức.' }, { status: 404 });
  }

  if (!canManageRecipe(actor, existing)) {
    return NextResponse.json(
      { message: 'Bạn không có quyền đổi trạng thái công thức này.' },
      { status: 403 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 });
  }

  const parsed = recipeStatusSchema.safeParse(
    typeof payload === 'object' && payload !== null && 'status' in payload
      ? (payload as { status: unknown }).status
      : undefined
  );

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Trạng thái công thức không hợp lệ.' },
      { status: 400 }
    );
  }

  const nextStatus = parsed.data;
  if (!canTransitionRecipeStatus(existing.status, nextStatus)) {
    const allowed = RECIPE_STATUS_TRANSITIONS[existing.status];
    return NextResponse.json(
      {
        message: `Không thể chuyển trạng thái từ "${RECIPE_STATUS_LABELS[existing.status]}" sang "${RECIPE_STATUS_LABELS[nextStatus]}".`,
        currentStatus: existing.status,
        allowedStatuses: allowed,
      },
      { status: 409 }
    );
  }

  const updated = updateMockRecipeStatus(id, nextStatus);
  if (!updated) {
    return NextResponse.json({ message: 'Không tìm thấy công thức.' }, { status: 404 });
  }

  revalidatePath('/', 'layout');

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    updatedAt: updated.updatedAt,
  });
}
