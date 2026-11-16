import {
  RECIPE_STATUS_BADGE_CLASSES,
  RECIPE_STATUS_LABELS,
} from '@/lib/recipe-status';
import type { RecipeStatus } from '@/types/api';

interface RecipeStatusBadgeProps {
  status: RecipeStatus;
  className?: string;
}

export function RecipeStatusBadge({ status, className = '' }: RecipeStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${RECIPE_STATUS_BADGE_CLASSES[status]} ${className}`}
    >
      {RECIPE_STATUS_LABELS[status]}
    </span>
  );
}
