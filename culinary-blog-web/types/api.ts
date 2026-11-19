export type RecipeStatus = 'Draft' | 'Published' | 'Archived' | 'Deleted';

export interface RecipeIngredientDto {
  id?: number | string | any;
  name: string;
  quantity: string | number | any;
  unit: string;
  notes?: string;
}

export interface RecipeStepDto {
  id?: number | string | any;
  stepNumber?: number;
  title?: string;
  description: string;
  durationMinutes?: number;
  imageUrl?: string | null;
}

export interface RecipeListDto {
  id?: number | string | any;
  title: string;
  slug: string;
  description: string;
  imageUrl?: string;
  primaryImageUrl?: string;
  status: RecipeStatus;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  totalTime?: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  categoryName: string;
  viewCount?: number;
}

export interface RecipeDto extends RecipeListDto {
  preparationTime: number;
  cookingTime: number;
  categoryId?: number | string | any;
  instructions?: string;
  likeCount: number;
  isLiked: boolean;
  ingredients: RecipeIngredientDto[];
  steps: RecipeStepDto[];
  tags?: string[];
}

export interface RecipeRequest {
  title: string;
  description: string;
  categoryId: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  primaryImageUrl?: string;
  tags?: string;
  status?: RecipeStatus;
  ingredients: RecipeIngredientDto[];
  steps: RecipeStepDto[];
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber?: number | string | any;
  page?: number | string | any;
  pageSize: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
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

export interface LoginResponseDto {
  accessToken: string;
  expiration: string;
  userId: string;
  email: string;
  name?: string | null;
  roles: string[];
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
  categoryId?: number | string | null;
  keyword?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  minTotalTime?: number;
  maxTotalTime?: number;
}

export interface AuthTokens {
  token: string;
  expiration: string;
}

export interface ProfileDto {
  id: string;
  email: string;
  userName: string;
  name?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  email: string;
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  email: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  expiration: string;
}

export interface AuthState {
  user: ProfileDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: ProfileDto | null, token: string | null) => void;
  login: (token: string, user: ProfileDto) => void;
  logout: () => void;
}

export interface RecipeFormValues {
  title: string;
  description: string;
  slug: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  categoryName: string;
  instructions?: string;
}

export interface CreateRecipeRequest extends RecipeFormValues {
  status?: RecipeStatus;
  imageFile?: File | null;
}

export interface UpdateRecipeRequest extends RecipeFormValues {
  imageFile?: File | null;
}

export interface CreateRecipeResponse {
  message: string;
  recipeId: number;
  status?: RecipeStatus;
  imageUrl?: string;
}

export interface UpdateRecipeResponse {
  message: string;
  recipeId: number;
  imageUrl?: string;
}

export interface ChangeStatusResponse {
  message: string;
  recipeId: number;
  status: RecipeStatus;
}

export interface StatusTransitions {
  currentStatus: RecipeStatus;
  allowedStatuses: RecipeStatus[];
}
