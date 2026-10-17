import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import apiClient from '@/lib/api/axios';
import { mockApi } from '@/lib/api/mockClient';
import { slugify } from '@/lib/utils/slugify';
import { CreateRecipeFormData } from '@/types/recipe';
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

// initialData cho phép seed sẵn cache từ dữ liệu Server Component (tránh nhấp nháy khi like)
export function useRecipe(slug: string | undefined, initialData?: RecipeDto) {
  return useQuery<RecipeDto | undefined>({
    queryKey: slug ? recipeKeys.detail(slug) : ['recipes', 'detail', 'null'],
    queryFn: async () => {
      if (USE_MOCK) {
        return mockApi.getRecipeBySlug(slug as string);
      }
      const response = await apiClient.get(`/api/recipes/${slug}`);
      return response.data as RecipeDto;
    },
    initialData,
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
}

// Kết quả trả về khi tạo công thức thành công
export interface CreateRecipeResult {
  id: number;
  slug: string;
  title: string;
}

// Lỗi validate trả về từ server (422): map theo đường dẫn field -> thông báo
export type RecipeFieldErrors = Record<string, string>;

interface UseCreateRecipeOptions {
  onValidationError?: (errors: RecipeFieldErrors) => void;
}

export function useCreateRecipe(options: UseCreateRecipeOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<CreateRecipeResult, unknown, CreateRecipeFormData>({
    mutationFn: async (data) => {
      if (USE_MOCK) {
        // Giả lập độ trễ mạng khi chạy mock
        await new Promise((resolve) => setTimeout(resolve, 800));
        return {
          id: Date.now(),
          slug: slugify(data.title),
          title: data.title,
        };
      }

      const response = await apiClient.post('/api/v1/recipes', data);
      return response.data as CreateRecipeResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
    onError: (error) => {
      // Xử lý lỗi 422 từ server: chuyển lỗi field về cho form qua setError
      if (isAxiosError(error) && error.response?.status === 422) {
        const payload = error.response.data as { errors?: RecipeFieldErrors } | undefined;
        if (payload?.errors && options.onValidationError) {
          options.onValidationError(payload.errors);
        }
      }
    },
  });
}

// Biến truyền vào mutation like: recipeId để gọi API, slug để định vị cache
export interface LikeRecipeVariables {
  recipeId: number;
  slug: string;
}

// Context lưu snapshot để rollback khi lỗi
interface LikeRecipeContext {
  previous: RecipeDto | undefined;
  slug: string;
}

export interface LikeRecipeResult {
  success: boolean;
}

// Optimistic update cho like/unlike công thức.
// Lưu ý: useRecipe dùng queryKey theo SLUG (recipeKeys.detail(slug)),
// nên mutation nhận { recipeId, slug } và LUÔN dùng recipeKeys.detail(slug) cho cache.
export function useLikeRecipe() {
  const queryClient = useQueryClient();

  return useMutation<LikeRecipeResult, unknown, LikeRecipeVariables, LikeRecipeContext>({
    mutationFn: async ({ recipeId }) => {
      if (USE_MOCK) {
        // Giả lập độ trễ mạng khi chạy mock
        await new Promise((resolve) => setTimeout(resolve, 600));
        // Cờ để test rollback khi optimistic update thất bại
        if (process.env.NEXT_PUBLIC_MOCK_LIKE_FAIL === 'true') {
          throw new Error('Giả lập lỗi like (mock)');
        }
        // Ghi nhớ trạng thái like để giữ nguyên sau khi refetch
        mockApi.toggleLike(recipeId);
        return { success: true };
      }

      const response = await apiClient.post(`/api/v1/recipes/${recipeId}/like`);
      return response.data as LikeRecipeResult;
    },

    // onMutate: cập nhật cache ngay lập tức (optimistic)
    onMutate: async ({ slug }) => {
      // Hủy các request đang chạy cho recipe này để tránh ghi đè
      await queryClient.cancelQueries({ queryKey: recipeKeys.detail(slug) });

      // Lưu snapshot để rollback nếu lỗi
      const previous = queryClient.getQueryData<RecipeDto>(recipeKeys.detail(slug));

      if (previous) {
        const willLike = !previous.isLiked;
        queryClient.setQueryData<RecipeDto>(recipeKeys.detail(slug), {
          ...previous,
          isLiked: willLike,
          likeCount: willLike
            ? previous.likeCount + 1
            : Math.max(0, previous.likeCount - 1),
        });
      }

      return { previous, slug };
    },

    // onError: rollback về snapshot
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData<RecipeDto>(recipeKeys.detail(context.slug), context.previous);
      }
    },

    // onSettled: đồng bộ lại với server
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(variables.slug) });
    },
  });
}
