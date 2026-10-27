export interface RecipeListDto {
  id: string;
  title: string;
  slug: string;
  description?: string;
  primaryImageUrl?: string;
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