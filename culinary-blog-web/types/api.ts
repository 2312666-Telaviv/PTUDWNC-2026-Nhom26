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
  authorName?: string;
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  expiration: string;
  userId: string;
  email: string;
  name?: string | null;
  roles: string[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AssignRoleRequest {
  email: string;
  role: 'Admin' | 'User';
}

export interface ApiProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
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
