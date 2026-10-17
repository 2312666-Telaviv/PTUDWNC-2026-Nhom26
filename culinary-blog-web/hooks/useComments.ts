import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/axios';
import { PaginatedResult, CommentDto } from '@/types/api';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

export function useInfiniteComments(recipeId: number) {
  return useInfiniteQuery({
    queryKey: ['recipes', 'comments', recipeId],
    queryFn: async ({ pageParam = 1 }) => {
      if (USE_MOCK) {
        const response = await fetch(`/api/mock/comments?recipeId=${recipeId}&page=${pageParam}&pageSize=10`);
        return response.json() as Promise<PaginatedResult<CommentDto> & { hasNextPage?: boolean }>;
      }
      const response = await apiClient.get('/api/comments', {
        params: { recipeId, pageNumber: pageParam, pageSize: 10 },
      });
      return response.data as PaginatedResult<CommentDto> & { hasNextPage?: boolean };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const hasNext = lastPage.hasNextPage ?? lastPage.pageNumber < lastPage.totalPages;
      return hasNext ? lastPage.pageNumber + 1 : undefined;
    },
    enabled: !!recipeId,
    staleTime: 30 * 1000,
  });
}
