'use client';

import { useUIStore } from '@/store/useUIStore';
import { RecipeListDto } from '@/types/api';
import { RecipeCard } from '@/components/recipe/RecipeCard';

interface RecipeGridProps {
  recipes: RecipeListDto[];
}

// Hiển thị công thức theo kiểu lưới hoặc danh sách tùy theo store.
// Nhận danh sách recipe qua props để giữ nguyên ISR cho trang /recipes.
export function RecipeGrid({ recipes }: RecipeGridProps) {
  const viewMode = useUIStore((state) => state.recipesViewMode);

  if (viewMode === 'list') {
    return (
      <ul className="space-y-4">
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <RecipeCard recipe={recipe} layout="row" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe, index) => (
        <RecipeCard key={recipe.id} recipe={recipe} priority={index < 3} />
      ))}
    </div>
  );
}
