import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recipeService } from '@/lib/api/services';
import { isApiError } from '@/lib/api/error';
import type {
  CreateRecipeRequest,
  PaginatedResult,
  RecipeDto,
  RecipeFilters,
  RecipeListDto,
  RecipeStatus,
  UpdateRecipeRequest,
} from '@/types/api';

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
    queryFn: () =>
      recipeService.getList({
        page: filters.page,
        pageSize: filters.pageSize,
        status: filters.status,
        categoryName:
          filters.categoryName ??
          (typeof filters.categoryId === 'string' ? filters.categoryId : undefined),
      }),
    staleTime: 60 * 1000,
  });
}

export function useRecipe(slug: string | undefined, initialData?: RecipeDto) {
  return useQuery<RecipeDto | undefined>({
    queryKey: slug ? recipeKeys.detail(slug) : ['recipes', 'detail', 'null'],
    queryFn: () => (slug ? recipeService.getBySlug(slug) : undefined),
    initialData,
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

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
  updatedAt?: string;
}

export type RecipeFieldErrors = Record<string, string>;

interface UseRecipeMutationOptions {
  onValidationError?: (errors: RecipeFieldErrors) => void;
}

function handleRecipeMutationError(error: unknown, options: UseRecipeMutationOptions) {
  if (!options.onValidationError || !isApiError(error) || !error.errors) return;

  const fieldErrors: RecipeFieldErrors = {};
  Object.entries(error.errors).forEach(([key, messages]) => {
    const rawField = key.split('.').pop() ?? key;
    const field = rawField.charAt(0).toLowerCase() + rawField.slice(1);
    fieldErrors[field] = messages[0] ?? 'Giá trị không hợp lệ';
  });

  if (Object.keys(fieldErrors).length > 0) {
    options.onValidationError(fieldErrors);
  }
}

function invalidateRecipeCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
  queryClient.invalidateQueries({ queryKey: recipeKeys.details() });
}

export function useCreateRecipe(options: UseRecipeMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<CreateRecipeResult, unknown, CreateRecipeRequest>({
    mutationFn: async (data) => {
      const response = await recipeService.createRecipe(data);
      const id = response.recipeId;
      if (typeof id !== 'number') {
        throw new Error('Backend không trả về mã công thức hợp lệ.');
      }

      const slug =
        typeof response.slug === 'string' && response.slug.trim()
          ? response.slug
          : (await recipeService.getById(id)).slug;

      return {
        id,
        slug,
        title: data.title,
        status: response.status,
      };
    },
    onSuccess: () => invalidateRecipeCaches(queryClient),
    onError: (error) => handleRecipeMutationError(error, options),
  });
}

export function useUpdateRecipe(id: number, options: UseRecipeMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<UpdateRecipeResult, unknown, UpdateRecipeRequest>({
    mutationFn: async (data) => {
      await recipeService.updateRecipe(id, data);
      return { id };
    },
    onSuccess: () => invalidateRecipeCaches(queryClient),
    onError: (error) => handleRecipeMutationError(error, options),
  });
}

export function useUpdateRecipeStatus(recipeId: number) {
  const queryClient = useQueryClient();

  return useMutation<UpdateRecipeStatusResult, unknown, RecipeStatus>({
    mutationFn: async (status) => {
      const response = await recipeService.changeStatus(recipeId, status);
      return { id: response.recipeId, status: response.status };
    },
    onSuccess: () => invalidateRecipeCaches(queryClient),
  });
}

export interface LikeRecipeVariables {
  recipeId: number;
  slug: string;
}

interface LikeRecipeContext {
  previous: RecipeDto | undefined;
  slug: string;
}

export interface LikeRecipeResult {
  success: boolean;
}

export function useLikeRecipe() {
  const queryClient = useQueryClient();

  return useMutation<LikeRecipeResult, unknown, LikeRecipeVariables, LikeRecipeContext>({
    mutationFn: async () => {
      throw new Error('Backend hiện chưa hỗ trợ tính năng thích công thức.');
    },
    onMutate: async ({ slug }) => {
      await queryClient.cancelQueries({ queryKey: recipeKeys.detail(slug) });
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
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData<RecipeDto>(recipeKeys.detail(context.slug), context.previous);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(variables.slug) });
    },
  });
}
