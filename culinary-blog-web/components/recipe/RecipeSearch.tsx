'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { RecipeGrid } from '@/components/recipe/RecipeGrid';
import { mockRecipes } from '@/lib/mock/recipes';

// Bỏ dấu tiếng Việt và viết thường để tìm "khai vi" vẫn ra "Khai vị"
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

function searchRecipes(query: string) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }

  return mockRecipes.filter((recipe) => {
    const haystack = normalize(
      [
        recipe.title,
        recipe.categoryName,
        recipe.description,
        ...recipe.ingredients.map((ingredient) => ingredient.name),
      ].join(' ')
    );
    // Công thức phải chứa tất cả các từ khóa người dùng gõ
    return words.every((word) => haystack.includes(word));
  });
}

export function RecipeSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const results = query ? searchRecipes(query) : [];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get('q') ?? '').trim();
    router.push(value ? `/recipes/search?q=${encodeURIComponent(value)}` : '/recipes/search');
  };

  return (
    <div>
      <form onSubmit={handleSubmit} role="search" className="mb-6 flex gap-2">
        <input
          key={query}
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Tìm theo tên món, nguyên liệu, danh mục..."
          aria-label="Từ khóa tìm kiếm"
          className="w-full rounded-md border border-orange-200 px-4 py-2 text-gray-900 focus:border-orange-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-orange-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
        >
          Tìm
        </button>
      </form>

      {!query && (
        <p className="py-8 text-center text-gray-500">
          Nhập từ khóa để tìm công thức (ví dụ: bún, nước mắm, khai vị).
        </p>
      )}

      {query && (
        <>
          <p className="mb-4 text-sm text-gray-600">
            Tìm thấy {results.length} công thức cho &quot;{query}&quot;
          </p>
          {results.length > 0 ? (
            <RecipeGrid recipes={results} />
          ) : (
            <p className="py-8 text-center text-gray-500">Không tìm thấy công thức nào phù hợp.</p>
          )}
        </>
      )}
    </div>
  );
}