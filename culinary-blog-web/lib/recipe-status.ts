import type { RecipeStatus } from '@/types/api';

// State machine của công thức. Đây là nguồn truth dùng chung cho cả server
// (API route kiểm tra chuyển trạng thái) và UI (chỉ hiện nút hợp lệ).
// Luồng: Draft -> Published -> Archived/Deleted.
export const RECIPE_STATUS_TRANSITIONS: Record<RecipeStatus, readonly RecipeStatus[]> = {
  Draft: ['Published', 'Deleted'],
  Published: ['Archived', 'Deleted'],
  Archived: ['Published', 'Deleted'],
  Deleted: ['Draft'],
};

export const RECIPE_STATUS_LABELS: Record<RecipeStatus, string> = {
  Draft: 'Bản nháp',
  Published: 'Đã xuất bản',
  Archived: 'Đã lưu trữ',
  Deleted: 'Đã xóa',
};

export const RECIPE_STATUS_BADGE_CLASSES: Record<RecipeStatus, string> = {
  Draft: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
  Published: 'bg-green-100 text-green-700 ring-1 ring-green-200',
  Archived: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  Deleted: 'bg-red-100 text-red-700 ring-1 ring-red-200',
};

export type RecipeStatusActionTone = 'primary' | 'secondary' | 'danger';

export interface RecipeStatusAction {
  to: RecipeStatus;
  label: string;
  tone: RecipeStatusActionTone;
  requireConfirm: boolean;
  confirmTitle: string;
  confirmDescription: string;
}

export function canTransitionRecipeStatus(from: RecipeStatus, to: RecipeStatus): boolean {
  return RECIPE_STATUS_TRANSITIONS[from].includes(to);
}

export function getRecipeStatusActions(status: RecipeStatus): RecipeStatusAction[] {
  return RECIPE_STATUS_TRANSITIONS[status].map((to) => {
    if (to === 'Published') {
      return {
        to,
        label: 'Xuất bản',
        tone: 'primary',
        requireConfirm: false,
        confirmTitle: '',
        confirmDescription: '',
      };
    }

    if (to === 'Archived') {
      return {
        to,
        label: 'Lưu trữ',
        tone: 'secondary',
        requireConfirm: true,
        confirmTitle: 'Lưu trữ công thức?',
        confirmDescription:
          'Công thức sẽ không còn hiển thị ở trang công khai cho đến khi được xử lý tiếp.',
      };
    }

    if (to === 'Draft') {
      return {
        to,
        label: 'Khôi phục bản nháp',
        tone: 'secondary',
        requireConfirm: false,
        confirmTitle: '',
        confirmDescription: '',
      };
    }

    return {
      to,
      label: 'Xóa',
      tone: 'danger',
      requireConfirm: true,
      confirmTitle: 'Xóa công thức?',
      confirmDescription:
        'Công thức sẽ được xóa mềm: dữ liệu vẫn còn trong hệ thống nhưng không hiển thị công khai.',
    };
  });
}

export function isPublicRecipeStatus(status: RecipeStatus): boolean {
  return status === 'Published';
}
