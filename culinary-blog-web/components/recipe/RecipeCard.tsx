import Image from 'next/image';
import Link from 'next/link';
import type { RecipeListDto } from '@/types/api';

interface RecipeCardProps { recipe: RecipeListDto; priority?: boolean; }

const difficultyLabel = { Easy: 'Dễ', Medium: 'Trung bình', Hard: 'Khó' } as const;

export function RecipeCard({ recipe, priority = false }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.slug}`} className="group block">
      <article className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition">
        <div className="relative aspect-video">
          <Image
            src={recipe.primaryImageUrl ?? '/images/recipe-placeholder.jpg'}
            alt={`Ảnh công thức: ${recipe.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={priority}
          />
          <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-white/90 rounded-full">
            {difficultyLabel[recipe.difficulty]}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{recipe.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{recipe.description}</p>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>⏱ {recipe.prepTimeMinutes + recipe.cookTimeMinutes} phút</span>
            <span>👥 {recipe.servings} người</span>
          </div>
        </div>
      </article>
    </Link>
  );
}