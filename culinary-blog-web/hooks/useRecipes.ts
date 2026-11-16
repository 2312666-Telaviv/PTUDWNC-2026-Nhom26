import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import apiClient from '@/lib/api/axios';
import mockRecipesClient from '@/lib/api/mockRecipesClient';
import { mockApi } from '@/lib/api/mockClient';
import { slugify } from '@/lib/utils/slugify';
import {
  PaginatedResult,
  RecipeDto,
  RecipeFilters,
  RecipeListDto,
  RecipeRequest,
  RecipeStatus,
} from '@/types/api';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// Backend .NET hiện mới nhận title/description/steps/ingredients.
// TODO: khi backend bổ sung category, thời gian, ảnh... thì map đầy đủ các field còn lại.
function toBackendCreatePayload(data: RecipeRequest) {
  return {
    title: data.title,
    description: data.description,
    steps: data.steps.map((step, index) => ({
      stepNumber: index + 1,
      instruction: step.description,
    })),
    ingredients: data.ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantity: `${ingredient.quantity} ${ingredient.unit}`.trim(),
    })),
  };
}

interface BackendCreateResponse {
  id?: number;
  recipeId?: number;
  slug?: string;
  title?: string;
}

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
      // Chế độ mock: gọi API route nội bộ để dùng chung state với server.
      if (USE_MOCK) {
        const response = await mockRecipesClient.get<PaginatedResult<RecipeListDto>>('', {
          params: filters,
        });
        return response.data;
      }
      const response = await apiClient.get('/recipes', { params: filters });
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
        try {
          const response = await mockRecipesClient.get<RecipeDto>(
            `/${encodeURIComponent(slug as string)}`
          );
          return response.data;
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 404) {
            return undefined;
          }
          throw error;
        }
      }
      const response = await apiClient.get(`/recipes/${slug}`);
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
  status?: RecipeStatus;
}

export interface UpdateRecipeResult {
  id: number;
}

export interface UpdateRecipeStatusResult {
  id: number;
  status: RecipeStatus;
  updatedAt: string;
}

// Lỗi validate trả về từ server (422): map theo đường dẫn field -> thông báo
export type RecipeFieldErrors = Record<string, string>;

interface UseRecipeMutationOptions {
  onValidationError?: (errors: RecipeFieldErrors) => void;
}

function handleRecipeMutationError(error: unknown, options: UseRecipeMutationOptions) {
  // Xử lý lỗi 422 từ server: chuyển lỗi field về cho form qua setError
  if (isAxiosError(error) && error.response?.status === 422) {
    const payload = error.response.data as { errors?: RecipeFieldErrors } | undefined;
    if (payload?.errors && options.onValidationError) {
      options.onValidationError(payload.errors);
    }
  }
}

function invalidateRecipeCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
  queryClient.invalidateQueries({ queryKey: recipeKeys.details() });
}

export function useCreateRecipe(options: UseRecipeMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<CreateRecipeResult, unknown, RecipeRequest>({
    mutationFn: async (data) => {
      if (USE_MOCK) {
        const response = await mockRecipesClient.post<CreateRecipeResult>('', data);
        return response.data;
      }

      const response = await apiClient.post<BackendCreateResponse>(
        '/recipes',
        toBackendCreatePayload(data)
      );
      const id = response.data.id ?? response.data.recipeId;
      if (typeof id !== 'number') {
        throw new Error('Backend không trả về mã công thức hợp lệ.');
      }

      return {
        id,
        slug: response.data.slug ?? slugify(data.title),
        title: response.data.title ?? data.title,
      };
    },
    onSuccess: () => {
      invalidateRecipeCaches(queryClient);
    },
    onError: (error) => handleRecipeMutationError(error, options),
  });
}

export function useUpdateRecipe(id: number, options: UseRecipeMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<UpdateRecipeResult, unknown, RecipeRequest>({
    mutationFn: async (data) => {
      if (USE_MOCK) {
        const response = await mockRecipesClient.put<RecipeDto>(`/${id}`, data);
        return { id: response.data.id };
      }

      await apiClient.put(`/recipes/${id}`, toBackendCreatePayload(data));
      return { id };
    },
    onSuccess: () => {
      invalidateRecipeCaches(queryClient);
    },
    onError: (error) => handleRecipeMutationError(error, options),
  });
}

export function useUpdateRecipeStatus(recipeId: number) {
  const queryClient = useQueryClient();

  return useMutation<UpdateRecipeStatusResult, unknown, RecipeStatus>({
    mutationFn: async (status) => {
      if (USE_MOCK) {
        const response = await mockRecipesClient.patch<UpdateRecipeStatusResult>(
          `/${recipeId}/status`,
          { status }
        );
        return response.data;
      }

      const response = await apiClient.patch<UpdateRecipeStatusResult>(
        `/recipes/${recipeId}/status`,
        { status }
      );
      return response.data;
    },
    onSuccess: () => {
      invalidateRecipeCaches(queryClient);
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

      const response = await apiClient.post(`/recipes/${recipeId}/like`);
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
