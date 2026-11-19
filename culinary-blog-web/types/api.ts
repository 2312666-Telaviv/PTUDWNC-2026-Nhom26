export type RecipeStatus = 'Draft' | 'Published' | 'Archived' | 'Deleted';

export interface RecipeListDto {
  id: number | string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  primaryImageUrl?: string;
  status?: RecipeStatus;
  authorId?: string;
  updatedAt?: string;
  publishedAt?: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  categoryName: string;
  authorName: string;
  createdAt: string;
}

export interface RecipeStepDto {
  id: string;
  stepNumber: number;
  description: string;
  durationMinutes?: number;
}

export interface RecipeIngredientDto {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface RecipeDto extends RecipeListDto {
  instructions?: string;
  steps: RecipeStepDto[];
  ingredients: RecipeIngredientDto[];
  likeCount: number;
  isLiked: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/* ===== Auth Types ===== */

export interface AuthTokens {
  token: string;
  expiration: string;
}

export interface ProfileDto {
  id: string;
  email: string;
  userName: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
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

/* ===== Recipe Create Types ===== */

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

/** Thông tin luồng chuyển trạng thái trả về từ API (dùng để vô hiệu hóa nút). */
export interface StatusTransitions {
  currentStatus: RecipeStatus;
  allowedStatuses: RecipeStatus[];
}