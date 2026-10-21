'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useLikeRecipe, useRecipe } from '@/hooks/useRecipes';
import { RecipeDto } from '@/types/api';

interface LikeButtonProps {
  // Nhận cả recipe (chứa id, slug, likeCount, isLiked) từ Server Component
  // để seed initialData cho useRecipe(slug), tránh nhấp nháy khi tải.
  recipe: RecipeDto;
}

export function LikeButton({ recipe }: LikeButtonProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Dùng cache theo slug; recipe từ server làm initialData để hiện ngay.
  // Số like lấy từ useRecipe nên tự cập nhật theo optimistic update.
  const { data } = useRecipe(recipe.slug, recipe);
  const likeRecipe = useLikeRecipe();

  const isLiked = data?.isLiked ?? recipe.isLiked ?? false;
  // Luôn có giá trị số để không bao giờ hiển thị trống
  const likeCount = data?.likeCount ?? recipe.likeCount ?? 0;
  const pending = likeRecipe.isPending;

  const handleClick = () => {
    // Chưa đăng nhập -> chuyển tới trang đăng nhập kèm callbackUrl
    if (status !== 'authenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (pending) {
      return;
    }

    // Số like tăng/giảm 1 ngay lập tức (optimistic), rollback nếu lỗi
    likeRecipe.mutate({ recipeId: recipe.id, slug: recipe.slug });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={isLiked}
      aria-label={isLiked ? 'Bỏ thích công thức' : 'Thích công thức'}
      className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        className={`text-lg leading-none ${
          isLiked ? 'font-bold text-red-500' : 'text-gray-400'
        }`}
        aria-hidden="true"
      >
        {isLiked ? '♥' : '♡'}
      </span>
      <span
        className={`text-sm tabular-nums ${
          isLiked ? 'font-bold text-red-500' : 'font-medium text-gray-700'
        }`}
        aria-live="polite"
      >
        {likeCount}
      </span>
    </button>
  );
}
