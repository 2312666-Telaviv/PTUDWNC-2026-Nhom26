import { CommentDto, PaginatedResult, RecipeDto, RecipeListDto } from '@/types/api';
import { getMockRecipeBySlug, getMockRecipes } from '@/lib/mock/recipes';

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
  getRecipeBySlug: (slug: string): RecipeDto | undefined => getMockRecipeBySlug(slug),
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
