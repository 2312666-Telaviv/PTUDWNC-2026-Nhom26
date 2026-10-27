import { axiosInstance } from './axios';
import { extractAxiosErrorMessage, ApiError } from './error';
import type { RecipeDto, RecipeListDto, PaginatedResult } from '@/types/api';
import type {
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  ProfileDto,
} from '@/types/api';

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
  async login(data: LoginRequest): Promise<AuthTokens> {
    try {
      const response = await axiosInstance.post<AuthTokens>(
        '/api/v1/auth/login',
        data
      );
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 401);
    }
  },

  /**
   * Đăng ký tài khoản mới.
   */
  async register(data: RegisterRequest): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post<{ message: string }>(
        '/api/v1/auth/register',
        data
      );
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 400);
    }
  },

  /**
   * Đổi mật khẩu (yêu cầu đăng nhập).
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post<{ message: string }>(
        '/api/v1/auth/change-password',
        data
      );
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 400);
    }
  },

  /**
   * Quên mật khẩu - gửi liên kết đặt lại mật khẩu.
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post<{ message: string }>(
        '/api/v1/auth/forgot-password',
        data
      );
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 400);
    }
  },

  /**
   * Đặt lại mật khẩu bằng token.
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post<{ message: string }>(
        '/api/v1/auth/reset-password',
        data
      );
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 400);
    }
  },

  /**
   * Lấy hồ sơ người dùng hiện tại (yêu cầu đăng nhập).
   */
  async getProfile(): Promise<ProfileDto> {
    try {
      const response = await axiosInstance.get<ProfileDto>('/api/v1/auth/profile');
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 401);
    }
  },

  /**
   * Cập nhật hồ sơ người dùng (yêu cầu đăng nhập).
   */
  async updateProfile(data: UpdateProfileRequest): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.put<{ message: string }>(
        '/api/v1/auth/profile',
        data
      );
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 400);
    }
  },

  /**
   * Đăng xuất (gọi API server-side logout).
   */
  async logout(): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post<{ message: string }>(
        '/api/v1/auth/logout'
      );
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 400);
    }
  },
};
