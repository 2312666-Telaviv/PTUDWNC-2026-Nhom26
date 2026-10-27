import { axiosInstance } from './axios';
import { extractAxiosErrorMessage, ApiError } from './error';
import type { RecipeDto, RecipeListDto, PaginatedResult } from '@/types/api';

/**
 * Service layer cho các thao tác với API công thức nấu ăn (Recipes).
 * Tập trung các endpoint gọi API ở một nơi, dễ bảo trì và test.
 */
export const recipeService = {
  /**
   * Lấy danh sách công thức có phân trang và lọc theo danh mục.
   */
  async getList(params?: {
    page?: number;
    pageSize?: number;
    categoryId?: string;
  }): Promise<PaginatedResult<RecipeListDto>> {
    try {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
      if (params?.categoryId) qs.set('categoryId', params.categoryId);

      const response = await axiosInstance.get<PaginatedResult<RecipeListDto>>(
        `/api/v1/recipes?${qs.toString()}`
      );
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 500);
    }
  },

  /**
   * Lấy chi tiết một công thức theo slug.
   */
  async getBySlug(slug: string): Promise<RecipeDto> {
    try {
      const response = await axiosInstance.get<RecipeDto>(
        `/api/v1/recipes/${slug}`
      );
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 404);
    }
  },
};

/**
 * Service layer cho các thao tác xác thực (Auth).
 */
export const authService = {
  /**
   * Đăng nhập, trả về JWT token.
   */
  async login(email: string, password: string) {
    try {
      const response = await axiosInstance.post<{
        token: string;
        expiration: string;
      }>('/api/v1/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 401);
    }
  },

  /**
   * Đăng ký tài khoản mới.
   */
  async register(email: string, password: string) {
    try {
      const response = await axiosInstance.post<{ message: string }>(
        '/api/v1/auth/register',
        { email, password }
      );
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 400);
    }
  },
};
