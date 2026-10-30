import Image from 'next/image';
import Link from 'next/link';
import { RecipeListDto } from '@/types/api';
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

  // Dạng hàng ngang cho danh sách
  if (layout === 'row') {
    return (
      <Link
        href={`/recipes/${recipe.slug}`}
        className="group flex flex-row overflow-hidden rounded-lg border border-orange-100 bg-white shadow-sm transition hover:shadow-md"
      >
        <div className="relative aspect-[16/9] w-40 shrink-0 overflow-hidden sm:w-56">
          <Image
            src={recipe.primaryImageUrl || '/images/recipe-placeholder.svg'}
            alt={recipe.title}
            fill
            sizes="(max-width: 640px) 160px, 224px"
            placeholder="blur"
            blurDataURL={blurDataUrl}
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 rounded-full bg-orange-600 px-2 py-1 text-xs font-medium text-white">
            {difficultyLabels[recipe.difficulty]}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center p-4">
          <h3 className="mb-1 text-lg font-semibold text-gray-900 group-hover:text-orange-600">
            {recipe.title}
          </h3>
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">{recipe.description}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span>Tổng: {recipe.totalTime} phút</span>
            <span>Khẩu phần: {recipe.servings} người</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-400">
            <span className="font-medium text-orange-600">{recipe.categoryName}</span>
            {recipe.authorName && <span>Tác giả: {recipe.authorName}</span>}
            {recipe.createdAt && (
              <time dateTime={recipe.createdAt}>{formatDate(recipe.createdAt)}</time>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group block overflow-hidden rounded-lg border border-orange-100 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={recipe.primaryImageUrl || '/images/recipe-placeholder.svg'}
          alt={recipe.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL={blurDataUrl}
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 rounded-full bg-orange-600 px-2 py-1 text-xs font-medium text-white">
          {difficultyLabels[recipe.difficulty]}
        </div>
      </div>
      <div className="p-4">
        <h3 className="mb-1 text-lg font-semibold text-gray-900 group-hover:text-orange-600">
          {recipe.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-sm text-gray-600">{recipe.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Tổng thời gian: {recipe.totalTime} phút</span>
          <span className="ml-3">Khẩu phần: {recipe.servings} người</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
          <span>{recipe.categoryName}</span>
          <span>{recipe.viewCount} lượt xem</span>
        </div>
        {(recipe.authorName || recipe.createdAt) && (
          <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 text-xs text-gray-400">
            {recipe.authorName && <span className="truncate">Tác giả: {recipe.authorName}</span>}
            {recipe.createdAt && (
              <time dateTime={recipe.createdAt}>{formatDate(recipe.createdAt)}</time>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
