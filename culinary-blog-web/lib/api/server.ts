import type { PaginatedResult, RecipeDto, RecipeListDto } from '@/types/api';
import { mockRecipes } from './mock';

const API_URL = process.env.API_URL; // không đặt biến này => dùng mock

async function get<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

type ListParams = { page: number; pageSize: number; categoryId?: string };

export const recipeApi = {
  async getList(p: ListParams): Promise<PaginatedResult<RecipeListDto>> {
    if (!API_URL) {
      const start = (p.page - 1) * p.pageSize;
      const items = mockRecipes.slice(start, start + p.pageSize);
      const totalPages = Math.ceil(mockRecipes.length / p.pageSize);
      return {
        items, totalCount: mockRecipes.length, page: p.page, pageSize: p.pageSize,
        totalPages, hasNextPage: p.page < totalPages, hasPreviousPage: p.page > 1,
      };
    }
    const qs = new URLSearchParams({ page: String(p.page), pageSize: String(p.pageSize) });
    if (p.categoryId) qs.set('categoryId', p.categoryId);
    return get(`/api/v1/recipes?${qs}`, { next: { revalidate: 3600 } });
  },

  async getBySlug(slug: string): Promise<RecipeDto> {
    if (!API_URL) {
      const found = mockRecipes.find((r) => r.slug === slug);
      if (!found) throw new Error('Not found');
      return found;
    }
    return get(`/api/v1/recipes/${slug}`, { cache: 'no-store' });
  },
};