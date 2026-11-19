import apiClient from './axios';
import {
  extractAxiosErrorMessage,
  extractAxiosStatusCode,
  extractAxiosValidationErrors,
  ApiError,
} from './error';
import { buildRecipeFormData, normalizePaginatedResult, normalizeRecipe } from './recipe-mapper';
import type {
  PaginatedResult,
  RecipeDto,
  RecipeListDto,
  RecipeStatus,
  LoginResponseDto,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  ProfileDto,
  CreateRecipeRequest,
  CreateRecipeResponse,
  UpdateRecipeRequest,
  UpdateRecipeResponse,
  ChangeStatusResponse,
} from '@/types/api';

export const recipeService = {
  async getList(params?: {
    page?: number;
    pageSize?: number;
    status?: RecipeStatus;
    categoryName?: string;
    includeSystemSeed?: boolean;
  }): Promise<PaginatedResult<RecipeListDto>> {
    try {
      const response = await apiClient.get('/recipes', {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 12,
          ...(params?.status ? { status: params.status } : {}),
          includeSystemSeed: params?.includeSystemSeed ?? false,
        },
      });

      const result = normalizePaginatedResult(response.data);
      if (!params?.categoryName) return result;

      const items = result.items.filter(
        (recipe) => recipe.categoryName === params.categoryName
      );
      const pageSize = result.pageSize;
      const totalPages = Math.ceil(items.length / pageSize);

      return {
        ...result,
        items,
        totalCount: items.length,
        totalPages,
        hasNextPage: result.page < totalPages,
      };
    } catch (error) {
      throw new ApiError(
        extractAxiosErrorMessage(error),
        extractAxiosStatusCode(error),
        extractAxiosValidationErrors(error)
      );
    }
  },

  async getBySlug(slug: string): Promise<RecipeDto> {
    try {
      const response = await apiClient.get(`/recipes/slug/${encodeURIComponent(slug)}`);
      return normalizeRecipe(response.data);
    } catch (error) {
      throw new ApiError(
        extractAxiosErrorMessage(error),
        extractAxiosStatusCode(error),
        extractAxiosValidationErrors(error)
      );
    }
  },

  async createRecipe(data: CreateRecipeRequest): Promise<CreateRecipeResponse> {
    try {
      const response = await apiClient.post<CreateRecipeResponse>(
        '/recipes',
        buildRecipeFormData(data)
      );
      return response.data;
    } catch (error) {
      throw new ApiError(
        extractAxiosErrorMessage(error),
        extractAxiosStatusCode(error),
        extractAxiosValidationErrors(error)
      );
    }
  },

  async getById(id: number): Promise<RecipeDto> {
    try {
      const response = await apiClient.get(`/recipes/${id}`);
      return normalizeRecipe(response.data);
    } catch (error) {
      throw new ApiError(
        extractAxiosErrorMessage(error),
        extractAxiosStatusCode(error),
        extractAxiosValidationErrors(error)
      );
    }
  },

  async getMyRecipes(): Promise<RecipeDto[]> {
    try {
      const response = await apiClient.get('/recipes/my');
      const raw = response.data;
      const items = Array.isArray(raw) ? raw : normalizePaginatedResult(raw).items;
      return items.map((item) => normalizeRecipe(item));
    } catch (error) {
      throw new ApiError(
        extractAxiosErrorMessage(error),
        extractAxiosStatusCode(error),
        extractAxiosValidationErrors(error)
      );
    }
  },

  async updateRecipe(id: number, data: UpdateRecipeRequest): Promise<UpdateRecipeResponse> {
    try {
      const response = await apiClient.put<UpdateRecipeResponse>(
        `/recipes/${id}`,
        buildRecipeFormData(data)
      );
      return response.data;
    } catch (error) {
      throw new ApiError(
        extractAxiosErrorMessage(error),
        extractAxiosStatusCode(error),
        extractAxiosValidationErrors(error)
      );
    }
  },

  async changeStatus(id: number, status: RecipeStatus): Promise<ChangeStatusResponse> {
    try {
      const response = await apiClient.patch<ChangeStatusResponse>(
        `/recipes/${id}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw new ApiError(
        extractAxiosErrorMessage(error),
        extractAxiosStatusCode(error),
        extractAxiosValidationErrors(error)
      );
    }
  },

  async deleteRecipe(id: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      throw new ApiError(
        extractAxiosErrorMessage(error),
        extractAxiosStatusCode(error),
        extractAxiosValidationErrors(error)
      );
    }
  },
};

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponseDto> {
    try {
      const response = await apiClient.post<LoginResponseDto>('/auth/login', data);
      return response.data;
    } catch (error) {
      throw new ApiError(
        extractAxiosErrorMessage(error),
        extractAxiosStatusCode(error),
        extractAxiosValidationErrors(error)
      );
    }
  },

  async register(data: RegisterRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw new ApiError(
        extractAxiosErrorMessage(error),
        extractAxiosStatusCode(error),
        extractAxiosValidationErrors(error)
      );
    }
  },

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/change-password', data);
      return response.data;
    } catch (error) {
      throw new ApiError(
        extractAxiosErrorMessage(error),
        extractAxiosStatusCode(error),
        extractAxiosValidationErrors(error)
      );
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
      return response.data;
    } catch (error) {
      throw new ApiError(
        extractAxiosErrorMessage(error),
        extractAxiosStatusCode(error),
        extractAxiosValidationErrors(error)
      );
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      throw new ApiError(
        extractAxiosErrorMessage(error),
        extractAxiosStatusCode(error),
        extractAxiosValidationErrors(error)
      );
    }
  },

  async getProfile(): Promise<ProfileDto> {
    try {
      const response = await apiClient.get<ProfileDto>('/auth/profile');
      return response.data;
    } catch (error) {
      throw new ApiError(
        extractAxiosErrorMessage(error),
        extractAxiosStatusCode(error),
        extractAxiosValidationErrors(error)
      );
    }
  },

  async updateProfile(data: UpdateProfileRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.put<{ message: string }>('/auth/profile', data);
      return response.data;
    } catch (error) {
      throw new ApiError(
        extractAxiosErrorMessage(error),
        extractAxiosStatusCode(error),
        extractAxiosValidationErrors(error)
      );
    }
  },

  async logout(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/logout');
      return response.data;
    } catch (error) {
      throw new ApiError(
        extractAxiosErrorMessage(error),
        extractAxiosStatusCode(error),
        extractAxiosValidationErrors(error)
      );
    }
  },
};
