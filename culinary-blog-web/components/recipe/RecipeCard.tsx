import Image from 'next/image';
import Link from 'next/link';
import { Clock3, Eye, Heart, MessageCircle, UserRound } from 'lucide-react';
import type { RecipeListDto } from '@/types/api';
import { formatDate } from '@/lib/utils/format';

interface RecipeCardProps {
  recipe: RecipeListDto;
  priority?: boolean;
  // 'card': dạng thẻ (dùng cho lưới); 'row': dạng hàng ngang (dùng cho danh sách)
  layout?: 'card' | 'row';
}

const difficultyLabels: Record<RecipeListDto['difficulty'], string> = {
  Easy: 'Dễ',
  Medium: 'Trung bình',
  Hard: 'Khó',
};

export function RecipeCard({ recipe, priority = false, layout = 'card' }: RecipeCardProps) {
  const blurDataUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect fill="%23fed7aa" width="100%" height="100%"/%3E%3C/svg%3E';
  const imageUrl = recipe.imageUrl || recipe.primaryImageUrl || '/images/recipe-placeholder.svg';
  const totalTime = recipe.totalTime ?? (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
  const imageAlt = `Ảnh công thức: ${recipe.title}`;

  const badges = (
    <>
      <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-orange-700 shadow-sm backdrop-blur">
        {difficultyLabels[recipe.difficulty]}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-900/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
        <Clock3 className="h-3 w-3" />
        {totalTime} phút
      </span>
    </>
  );

  const meta = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
      <span className="rounded-full bg-orange-50 px-2.5 py-1 font-medium text-orange-700">
        {recipe.categoryName}
      </span>
      {recipe.authorName && (
        <span className="inline-flex items-center gap-1">
          <UserRound className="h-3.5 w-3.5 text-orange-500" />
          <span className="max-w-[120px] truncate">{recipe.authorName}</span>
        </span>
      )}
      {recipe.likeCount !== undefined && (
        <span className="inline-flex items-center gap-1">
          <Heart className="h-3.5 w-3.5 text-orange-500" />
          {recipe.likeCount}
        </span>
      )}
      {recipe.viewCount !== undefined && (
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          {recipe.viewCount}
        </span>
      )}
      {recipe.commentCount !== undefined && (
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" />
          {recipe.commentCount}
        </span>
      )}
      {recipe.createdAt && (
        <time dateTime={recipe.createdAt}>{formatDate(recipe.createdAt)}</time>
      )}
    </div>
  );

  // Dạng hàng ngang cho danh sách
  if (layout === 'row') {
    return (
      <Link
        href={`/recipes/${recipe.slug}`}
        className="group flex flex-row overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div className="relative aspect-[16/9] w-40 shrink-0 overflow-hidden sm:w-56">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 160px, 224px"
            placeholder="blur"
            blurDataURL={blurDataUrl}
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-1">
            {badges}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center p-4 sm:p-5">
          <h3 className="mb-1 line-clamp-2 text-lg font-bold text-gray-900 transition group-hover:text-[#EA580C]">
            {recipe.title}
          </h3>
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
            {recipe.description}
          </p>
          <div className="text-sm text-gray-500">Khẩu phần: {recipe.servings} người</div>
          <div className="mt-2">{meta}</div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group block h-full overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL={blurDataUrl}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          {badges}
        </div>
      </div>
      <div className="flex min-h-[190px] flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-gray-900 transition group-hover:text-[#EA580C]">
          {recipe.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-600">
          {recipe.description}
        </p>
        <div className="mt-4 border-t border-orange-50 pt-3">{meta}</div>
      </div>
    </Link>
  );
}
