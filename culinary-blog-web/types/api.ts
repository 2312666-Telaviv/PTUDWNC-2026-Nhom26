export interface RecipeIngredientDto {
  id: number;
  name: string;
  quantity: string;
  unit: string;
}

export interface RecipeStepDto {
  id: number;
  stepNumber: number;
  title: string;
  description: string;
  imageUrl?: string | null;
}

export interface RecipeDto {
  id: number;
  title: string;
  slug: string;
  description: string;
  preparationTime: number;
  cookingTime: number;
  totalTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  categoryId: number;
  categoryName: string;
  authorId: string;
  authorName: string;
  primaryImageUrl: string;
  status: 'Draft' | 'Published' | 'Archived';
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  ingredients: RecipeIngredientDto[];
  steps: RecipeStepDto[];
  tags?: string[];
}

export interface RecipeListDto {
  id: number;
  title: string;
  slug: string;
  description: string;
  totalTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  categoryName: string;
  primaryImageUrl: string;
  viewCount: number;
  createdAt: string;
}

export interface CommentDto {
  id: number;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  parentId?: number | null;
  replies?: CommentDto[];
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface RecipeFilters {
  page?: number;
  pageSize?: number;
  categoryId?: number | null;
  keyword?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  minTotalTime?: number;
  maxTotalTime?: number;
}
