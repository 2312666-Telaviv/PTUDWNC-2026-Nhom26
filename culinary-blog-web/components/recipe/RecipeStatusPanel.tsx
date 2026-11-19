'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeStatusBadge } from '@/components/recipe/RecipeStatusBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { getApiErrorMessage } from '@/lib/api/errorMessage';
import { useUpdateRecipeStatus } from '@/hooks/useRecipes';
import {
  getRecipeStatusActions,
  RECIPE_STATUS_LABELS,
  type RecipeStatusAction,
} from '@/lib/recipe-status';
import type { RecipeStatus } from '@/types/api';

interface RecipeStatusPanelProps {
  recipeId: number;
  status: RecipeStatus;
}

const toneClasses: Record<RecipeStatusAction['tone'], string> = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-outline',
  danger: 'btn btn-outline border-red-300 text-red-700 hover:bg-red-50',
};

export function RecipeStatusPanel({ recipeId, status }: RecipeStatusPanelProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [pendingAction, setPendingAction] = useState<RecipeStatusAction | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useUpdateRecipeStatus(recipeId);
  const actions = getRecipeStatusActions(currentStatus);

  const applyStatus = async (nextStatus: RecipeStatus) => {
    setError(null);
    setMessage(null);

    try {
      await updateStatus.mutateAsync(nextStatus);
      setCurrentStatus(nextStatus);
      setPendingAction(null);
      setMessage(`Đã chuyển sang trạng thái "${RECIPE_STATUS_LABELS[nextStatus]}".`);

      if (nextStatus === 'Deleted') {
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 800);
        return;
      }

      router.refresh();
    } catch (mutationError) {
      setPendingAction(null);
      setError(getApiErrorMessage(mutationError, 'Không thể đổi trạng thái công thức.'));
    }
  };

  const handleAction = (action: RecipeStatusAction) => {
    if (action.requireConfirm) {
      setPendingAction(action);
      return;
    }
    void applyStatus(action.to);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Trạng thái công thức</h2>
          <p className="mt-1 text-sm text-gray-600">
            Chỉ công thức đã xuất bản mới hiển thị công khai.
          </p>
        </div>
        <RecipeStatusBadge status={currentStatus} />
      </div>

      {message && (
        <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {actions.length > 0 ? (
          actions.map((action) => (
            <button
              key={action.to}
              type="button"
              className={toneClasses[action.tone]}
              onClick={() => handleAction(action)}
              disabled={updateStatus.isPending}
            >
              {action.label}
            </button>
          ))
        ) : (
          <p className="text-sm text-gray-600">
            Công thức đã bị xóa mềm và không còn thao tác trạng thái nào.
          </p>
        )}
      </div>

      <ConfirmModal
        open={pendingAction !== null}
        title={pendingAction?.confirmTitle ?? ''}
        description={pendingAction?.confirmDescription ?? ''}
        confirmLabel={pendingAction?.label}
        loading={updateStatus.isPending}
        onConfirm={() => {
          if (pendingAction) {
            void applyStatus(pendingAction.to);
          }
        }}
        onClose={() => {
          if (!updateStatus.isPending) {
            setPendingAction(null);
          }
        }}
      />
    </div>
  );
}
