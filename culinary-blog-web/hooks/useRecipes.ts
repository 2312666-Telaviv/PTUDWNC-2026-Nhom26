import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/axios';
import { mockApi } from '@/lib/api/mockClient';
import { PaginatedResult, RecipeDto, RecipeFilters, RecipeListDto } from '@/types/api';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (filters: RecipeFilters = {}) => [...recipeKeys.lists(), filters] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (slug: string) => [...recipeKeys.details(), slug] as const,
  comments: (recipeId: number) => [...recipeKeys.all, 'comments', recipeId] as const,
};

export function useRecipes(filters: RecipeFilters = {}) {
  return useQuery<PaginatedResult<RecipeListDto>>({
    queryKey: recipeKeys.list(filters),
    queryFn: async () => {
      // Chế độ mock: trả dữ liệu mẫu để chạy được khi backend .NET chưa sẵn sàng
      if (USE_MOCK) {
        return mockApi.getRecipes(filters.page ?? 1, filters.pageSize ?? 12);
      }
      const response = await apiClient.get('/api/recipes', { params: filters });
      return response.data as PaginatedResult<RecipeListDto>;
    },
    staleTime: 60 * 1000, // 1 phút
  });
}

export function useRecipe(slug: string | undefined) {
  return useQuery<RecipeDto | undefined>({
    queryKey: slug ? recipeKeys.detail(slug) : ['recipes', 'detail', 'null'],
    queryFn: async () => {
      if (USE_MOCK) {
        return mockApi.getRecipeBySlug(slug as string);
      }
      const response = await apiClient.get(`/api/recipes/${slug}`);
      return response.data as RecipeDto;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
}
