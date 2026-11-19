import apiClient from './axios';
import { normalizePaginatedResult, normalizeRecipe } from './recipe-mapper';
import { slugify } from '@/lib/utils/slugify';
import type { PaginatedResult, RecipeDto, RecipeListDto } from '@/types/api';
import type { CategoryDto } from '@/types/category';

interface GetListParams {
  page?: number;
  pageSize?: number;
  categoryName?: string;
  status?: 'Draft' | 'Published' | 'Archived' | 'Deleted';
  includeSystemSeed?: boolean;
}

const apiBaseUrl = `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5041')
  .replace(/\/api\/?$/, '')
  .replace(/\/+$/, '')}/api/v1`;

async function fetchFromApi<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<T>(endpoint, { params });
  return response.data;
}

async function fetchFromApiWithToken<T>(
  endpoint: string,
  accessToken: string,
  params?: Record<string, unknown>
): Promise<T> {
  const url = new URL(`${apiBaseUrl}${endpoint}`);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  });

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API ${endpoint} trả về ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const recipeApi = {
  async getList(params: GetListParams = {}): Promise<PaginatedResult<RecipeListDto>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 12;

    try {
      const raw = await fetchFromApi<Record<string, unknown>>('/recipes', {
        page,
        pageSize,
        ...(params.status ? { status: params.status } : {}),
        includeSystemSeed: params.includeSystemSeed ?? false,
      });
      const result = normalizePaginatedResult(raw);
      if (!params.categoryName) return result;

      const items = result.items.filter(
        (recipe) => recipe.categoryName === params.categoryName
      );
      const totalPages = Math.ceil(items.length / pageSize);

      return {
        ...result,
        items,
        totalCount: items.length,
        totalPages,
        hasNextPage: page < totalPages,
      };
    } catch (error) {
      console.warn('Không tải được danh sách công thức từ API:', error);
      return {
        items: [],
        totalCount: 0,
        page,
        pageNumber: page,
        pageSize,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: page > 1,
      };
    }
  },

  async getLatest(limit = 6): Promise<RecipeListDto[]> {
    const result = await recipeApi.getList({ page: 1, pageSize: limit, status: 'Published' });
    return [...result.items]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  async getBySlug(slug: string): Promise<RecipeDto> {
    const raw = await fetchFromApi<Record<string, unknown>>(
      `/recipes/slug/${encodeURIComponent(slug)}`
    );
    return normalizeRecipe(raw);
  },

  async getById(id: number): Promise<RecipeDto> {
    const raw = await fetchFromApi<Record<string, unknown>>(`/recipes/${id}`);
    return normalizeRecipe(raw);
  },

  async getMyForUser(accessToken: string): Promise<RecipeListDto[]> {
    try {
      const raw = await fetchFromApiWithToken<unknown>('/recipes/my', accessToken);
      if (!Array.isArray(raw)) return [];
      return raw.map((item) =>
        normalizeRecipe(item as Record<string, unknown>)
      );
    } catch (error) {
      console.warn('Không tải được công thức của người dùng hiện tại:', error);
      return [];
    }
  },
};

export const categoryApi = {
  async getList(): Promise<CategoryDto[]> {
    try {
      const raw = await fetchFromApi<unknown>('/categories');
      if (!Array.isArray(raw)) return [];

      return raw
        .map((item): CategoryDto | null => {
          if (!item || typeof item !== 'object') return null;
          const category = item as Record<string, unknown>;
          const name = typeof category.name === 'string' ? category.name.trim() : '';
          if (!name) return null;

          const slug =
            typeof category.slug === 'string' && category.slug ? category.slug : slugify(name);
          return { id: String(category.id ?? slug), name, slug };
        })
        .filter((category): category is CategoryDto => category !== null)
        .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } catch (error) {
      console.warn('Không tải được danh mục từ API:', error);
      return [];
    }
  },
};
