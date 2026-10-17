import { CommentDto, PaginatedResult, RecipeDto, RecipeListDto } from '@/types/api';
import { getMockRecipeBySlug, getMockRecipes, mockRecipes } from '@/lib/mock/recipes';

// Lưu tạm trạng thái like trong bộ nhớ để giữ nguyên sau khi refetch ở chế độ mock
const likeOverrides = new Map<number, { likeCount: number; isLiked: boolean }>();

export const mockApi = {
  getRecipes: (page: number = 1, pageSize: number = 12): PaginatedResult<RecipeListDto> => {
    const all = getMockRecipes();
    const start = (page - 1) * pageSize;
    return {
      items: all.slice(start, start + pageSize),
      totalCount: all.length,
      pageNumber: page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(all.length / pageSize)),
    };
  },
  getRecipeBySlug: (slug: string): RecipeDto | undefined => {
    const recipe = getMockRecipeBySlug(slug);
    if (!recipe) {
      return undefined;
    }
    const override = likeOverrides.get(recipe.id);
    return override ? { ...recipe, ...override } : recipe;
  },

  // Đảo trạng thái like và ghi nhớ trong bộ nhớ (dùng cho chế độ mock)
  toggleLike: (recipeId: number): { likeCount: number; isLiked: boolean } | undefined => {
    const recipe = mockRecipes.find((item) => item.id === recipeId);
    if (!recipe) {
      return undefined;
    }
    const current = likeOverrides.get(recipeId) ?? {
      likeCount: recipe.likeCount,
      isLiked: recipe.isLiked,
    };
    const willLike = !current.isLiked;
    const next = {
      isLiked: willLike,
      likeCount: willLike ? current.likeCount + 1 : Math.max(0, current.likeCount - 1),
    };
    likeOverrides.set(recipeId, next);
    return next;
  },
  getComments: (recipeId: number, page: number = 1, pageSize: number = 10): PaginatedResult<CommentDto> => {
    const allComments: CommentDto[] = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      content: `Bình luận ${i + 1} về công thức #${recipeId}`,
      authorId: `user-${(i % 3) + 1}`,
      authorName: i % 3 === 0 ? 'Nguyễn Văn A' : i % 3 === 1 ? 'Trần Thị B' : 'Lê Minh C',
      authorAvatarUrl: null,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
      parentId: null,
      replies: [],
    }));
    const start = (page - 1) * pageSize;
    const hasNext = start + pageSize < allComments.length;
    const items = allComments.slice(start, start + pageSize);
    const base: PaginatedResult<CommentDto> = {
      items,
      totalCount: allComments.length,
      pageNumber: page,
      pageSize,
      totalPages: Math.ceil(allComments.length / pageSize),
    };
    return {
      ...base,
      hasNextPage: hasNext,
    } as PaginatedResult<CommentDto> & { hasNextPage?: boolean };
  },
};
