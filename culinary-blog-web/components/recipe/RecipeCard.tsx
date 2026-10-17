import Image from 'next/image';
import Link from 'next/link';
import { RecipeListDto } from '@/types/api';

interface RecipeCardProps {
  recipe: RecipeListDto;
  priority?: boolean;
}

const difficultyLabels: Record<RecipeListDto['difficulty'], string> = {
  Easy: 'Dễ',
  Medium: 'Trung bình',
  Hard: 'Khó',
};

export function RecipeCard({ recipe, priority = false }: RecipeCardProps) {
  const blurDataUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect fill="%23fed7aa" width="100%" height="100%"/%3E%3C/svg%3E';

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
      </div>
    </Link>
  );
}
