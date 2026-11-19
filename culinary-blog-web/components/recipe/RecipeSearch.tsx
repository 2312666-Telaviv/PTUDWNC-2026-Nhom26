'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { RecipeGrid } from '@/components/recipe/RecipeGrid';
import { mockRecipes } from '@/lib/mock/recipes';

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type SortValue = '-createdAt' | 'createdAt' | 'title' | '-title' | 'cookTime' | '-cookTime';
type MockRecipe = (typeof mockRecipes)[number];

const DEFAULT_SORT: SortValue = '-createdAt';

const difficultyOptions: Array<{ value: Difficulty; label: string }> = [
  { value: 'Easy', label: 'Dễ' },
  { value: 'Medium', label: 'Trung bình' },
  { value: 'Hard', label: 'Khó' },
];

const sortOptions: Array<{ value: SortValue; label: string }> = [
  { value: '-createdAt', label: 'Mới nhất' },
  { value: 'createdAt', label: 'Cũ nhất' },
  { value: 'title', label: 'Tên A → Z' },
  { value: '-title', label: 'Tên Z → A' },
  { value: 'cookTime', label: 'Nấu nhanh nhất' },
  { value: '-cookTime', label: 'Nấu lâu nhất' },
];

interface SearchFilters {
  query: string;
  difficulty?: Difficulty;
  maxCookTime?: number;
  minServings?: number;
  sort: SortValue;
}

// Bỏ dấu tiếng Việt và viết thường để tìm "khai vi" vẫn ra "Khai vị"
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

function parseDifficulty(value: string | null): Difficulty | undefined {
  return value === 'Easy' || value === 'Medium' || value === 'Hard' ? value : undefined;
}

function parseSort(value: string | null): SortValue {
  return sortOptions.find((option) => option.value === value)?.value ?? DEFAULT_SORT;
}

function parsePositiveInt(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function searchRecipes(filters: SearchFilters): MockRecipe[] {
  const words = normalize(filters.query).split(/\s+/).filter(Boolean);

  const matched = mockRecipes.filter((recipe) => {
    if (words.length > 0) {
      const haystack = normalize(
        [
          recipe.title,
          recipe.categoryName,
          recipe.description,
          ...recipe.ingredients.map((ingredient) => ingredient.name),
        ].join(' ')
      );
      // Công thức phải chứa tất cả các từ khóa người dùng gõ
      if (!words.every((word) => haystack.includes(word))) {
        return false;
      }
    }
    if (filters.difficulty && recipe.difficulty !== filters.difficulty) {
      return false;
    }
    if (filters.maxCookTime !== undefined && recipe.cookingTime > filters.maxCookTime) {
      return false;
    }
    if (filters.minServings !== undefined && recipe.servings < filters.minServings) {
      return false;
    }
    return true;
  });

  // Tiền tố "-" nghĩa là sắp xếp giảm dần (theo SRS)
  const descending = filters.sort.startsWith('-');
  const field = descending ? filters.sort.slice(1) : filters.sort;
  const direction = descending ? -1 : 1;

  return [...matched].sort((a, b) => {
    if (field === 'title') {
      return a.title.localeCompare(b.title, 'vi') * direction;
    }
    if (field === 'cookTime') {
      return (a.cookingTime - b.cookingTime) * direction;
    }
    return (Date.parse(a.createdAt) - Date.parse(b.createdAt)) * direction;
  });
}

const fieldClass =
  'mt-1 w-full rounded-md border border-orange-200 bg-white px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none';

export function RecipeSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: SearchFilters = {
    query: (searchParams.get('q') ?? '').trim(),
    difficulty: parseDifficulty(searchParams.get('difficulty')),
    maxCookTime: parsePositiveInt(searchParams.get('maxCookTime')),
    minServings: parsePositiveInt(searchParams.get('minServings')),
    sort: parseSort(searchParams.get('sort')),
  };

  const hasCriteria = Boolean(
    filters.query || filters.difficulty || filters.maxCookTime || filters.minServings
  );
  const hasAnyParam = hasCriteria || filters.sort !== DEFAULT_SORT;
  const results = hasCriteria ? searchRecipes(filters) : [];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const q = String(data.get('q') ?? '').trim();
    if (q) {
      params.set('q', q);
    }

    const difficulty = parseDifficulty(String(data.get('difficulty') ?? ''));
    if (difficulty) {
      params.set('difficulty', difficulty);
    }

    const maxCookTime = parsePositiveInt(String(data.get('maxCookTime') ?? ''));
    if (maxCookTime) {
      params.set('maxCookTime', String(maxCookTime));
    }

    const minServings = parsePositiveInt(String(data.get('minServings') ?? ''));
    if (minServings) {
      params.set('minServings', String(minServings));
    }

    const sort = parseSort(String(data.get('sort') ?? ''));
    if (sort !== DEFAULT_SORT) {
      params.set('sort', sort);
    }

    const queryString = params.toString();
    router.push(queryString ? `/recipes/search?${queryString}` : '/recipes/search');
  };

  return (
    <div>
      <form
        key={searchParams.toString()}
        onSubmit={handleSubmit}
        role="search"
        className="mb-6 rounded-lg border border-orange-100 bg-white p-4"
      >
        <div className="flex gap-2">
          <input
            name="q"
            type="search"
            defaultValue={filters.query}
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
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm text-gray-700">
            Độ khó
            <select name="difficulty" defaultValue={filters.difficulty ?? ''} className={fieldClass}>
              <option value="">Tất cả</option>
              {difficultyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-gray-700">
            Thời gian nấu tối đa (phút)
            <input
              name="maxCookTime"
              type="number"
              min={1}
              defaultValue={filters.maxCookTime ?? ''}
              placeholder="Ví dụ: 30"
              className={fieldClass}
            />
          </label>

          <label className="block text-sm text-gray-700">
            Số khẩu phần tối thiểu
            <input
              name="minServings"
              type="number"
              min={1}
              defaultValue={filters.minServings ?? ''}
              placeholder="Ví dụ: 4"
              className={fieldClass}
            />
          </label>

          <label className="block text-sm text-gray-700">
            Sắp xếp
            <select name="sort" defaultValue={filters.sort} className={fieldClass}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {hasAnyParam && (
          <div className="mt-3">
            <Link href="/recipes/search" className="text-sm text-orange-700 hover:underline">
              Xóa bộ lọc
            </Link>
          </div>
        )}
      </form>

      {!hasCriteria && (
        <p className="py-8 text-center text-gray-500">
          Nhập từ khóa hoặc chọn bộ lọc để tìm công thức (ví dụ: bún, nước mắm, khai vị).
        </p>
      )}

      {hasCriteria && (
        <>
          <p className="mb-4 text-sm text-gray-600">
            Tìm thấy {results.length} công thức
            {filters.query ? ` cho "${filters.query}"` : ''}
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