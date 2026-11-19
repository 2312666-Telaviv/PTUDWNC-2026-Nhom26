'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RecipeGrid } from '@/components/recipe/RecipeGrid';
import { recipeService } from '@/lib/api/services';
import type { RecipeListDto } from '@/types/api';

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type SortValue = '-createdAt' | 'createdAt' | 'title' | '-title' | 'cookTime' | '-cookTime';

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
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function filterAndSortRecipes(recipes: RecipeListDto[], filters: SearchFilters): RecipeListDto[] {
  const words = normalize(filters.query).split(/\s+/).filter(Boolean);
  const matched = recipes.filter((recipe) => {
    if (words.length > 0) {
      const haystack = normalize(
        [recipe.title, recipe.categoryName, recipe.description].join(' ')
      );
      if (!words.every((word) => haystack.includes(word))) return false;
    }
    if (filters.difficulty && recipe.difficulty !== filters.difficulty) return false;
    if (filters.maxCookTime && (recipe.cookTimeMinutes ?? 0) > filters.maxCookTime) return false;
    if (filters.minServings && recipe.servings < filters.minServings) return false;
    return true;
  });

  const descending = filters.sort.startsWith('-');
  const field = descending ? filters.sort.slice(1) : filters.sort;
  const direction = descending ? -1 : 1;

  return matched.sort((a, b) => {
    if (field === 'title') return a.title.localeCompare(b.title, 'vi') * direction;
    if (field === 'cookTime') {
      return ((a.cookTimeMinutes ?? 0) - (b.cookTimeMinutes ?? 0)) * direction;
    }
    return (Date.parse(a.createdAt) - Date.parse(b.createdAt)) * direction;
  });
}

const fieldClass =
  'mt-1 w-full rounded-md border border-orange-200 bg-white px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none';

export function RecipeSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const filters: SearchFilters = {
    query: (searchParams.get('q') ?? '').trim(),
    difficulty: parseDifficulty(searchParams.get('difficulty')),
    maxCookTime: parsePositiveInt(searchParams.get('maxCookTime')),
    minServings: parsePositiveInt(searchParams.get('minServings')),
    sort: parseSort(searchParams.get('sort')),
  };

  const [results, setResults] = useState<RecipeListDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    recipeService
      .getList({ page: 1, pageSize: 100, status: 'Published' })
      .then((result) => {
        if (!active) return;
        const params = new URLSearchParams(search);
        const current: SearchFilters = {
          query: (params.get('q') ?? '').trim(),
          difficulty: parseDifficulty(params.get('difficulty')),
          maxCookTime: parsePositiveInt(params.get('maxCookTime')),
          minServings: parsePositiveInt(params.get('minServings')),
          sort: parseSort(params.get('sort')),
        };
        setResults(filterAndSortRecipes(result.items, current));
      })
      .catch((cause) => {
        if (!active) return;
        setResults([]);
        setError(cause instanceof Error ? cause.message : 'Không thể tải công thức.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search]);

  const hasCriteria = Boolean(
    filters.query || filters.difficulty || filters.maxCookTime || filters.minServings
  );
  const hasAnyParam = hasCriteria || filters.sort !== DEFAULT_SORT;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const q = String(data.get('q') ?? '').trim();
    if (q) params.set('q', q);

    const difficulty = parseDifficulty(String(data.get('difficulty') ?? ''));
    if (difficulty) params.set('difficulty', difficulty);

    const maxCookTime = parsePositiveInt(String(data.get('maxCookTime') ?? ''));
    if (maxCookTime) params.set('maxCookTime', String(maxCookTime));

    const minServings = parsePositiveInt(String(data.get('minServings') ?? ''));
    if (minServings) params.set('minServings', String(minServings));

    const sort = parseSort(String(data.get('sort') ?? ''));
    if (sort !== DEFAULT_SORT) params.set('sort', sort);

    router.push(params.toString() ? `/recipes/search?${params.toString()}` : '/recipes/search');
  };

  return (
    <div>
      <form
        key={search}
        onSubmit={handleSubmit}
        role="search"
        className="mb-6 rounded-lg border border-orange-100 bg-white p-4"
      >
        <div className="flex gap-2">
          <input
            name="q"
            type="search"
            defaultValue={filters.query}
            placeholder="Tìm theo tên món, danh mục..."
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

      {isLoading && <p className="py-8 text-center text-gray-500">Đang tìm công thức...</p>}
      {!isLoading && error && (
        <p className="py-8 text-center text-red-600">{error}</p>
      )}
      {!isLoading && !error && !hasCriteria && (
        <p className="py-8 text-center text-gray-500">
          Nhập từ khóa hoặc chọn bộ lọc để tìm công thức.
        </p>
      )}
      {!isLoading && !error && hasCriteria && (
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
