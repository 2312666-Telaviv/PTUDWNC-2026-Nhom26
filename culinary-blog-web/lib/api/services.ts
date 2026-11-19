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
  RecipeStatus,
  RecipeFormValues,
  CreateRecipeRequest,
  CreateRecipeResponse,
  UpdateRecipeRequest,
  UpdateRecipeResponse,
  ChangeStatusResponse,
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

      const response = await axiosInstance.get<any>(
        `/api/v1/recipes?${qs.toString()}`
      );
      // Backend trả thêm thông tin benchmark, ta chỉ map phần phân trang
      return {
        items: response.data.items ?? response.data.data ?? [],
        totalCount: response.data.totalCount ?? 0,
        page: response.data.page ?? 1,
        pageSize: response.data.pageSize ?? 10,
        totalPages: response.data.totalPages ?? 0,
        hasNextPage: response.data.hasNextPage ?? false,
        hasPreviousPage: response.data.hasPreviousPage ?? false,
      };
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
        `/api/v1/recipes/slug/${encodeURIComponent(slug)}`
      );
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 404);
    }
  },

  /**
   * Tạo công thức mới kèm upload ảnh (yêu cầu đăng nhập).
   */
  async createRecipe(data: CreateRecipeRequest): Promise<CreateRecipeResponse> {
    try {
      const formData = new FormData();
      formData.append('Title', data.title);
      formData.append('Description', data.description);
      formData.append('Slug', data.slug);
      formData.append('PrepTimeMinutes', String(data.prepTimeMinutes));
      formData.append('CookTimeMinutes', String(data.cookTimeMinutes));
      formData.append('Servings', String(data.servings));
      formData.append('Difficulty', data.difficulty);
      formData.append('CategoryName', data.categoryName);
      if (data.instructions) formData.append('Instructions', data.instructions);
      if (data.status) formData.append('Status', data.status);
      if (data.imageFile) formData.append('imageFile', data.imageFile);

      const response = await axiosInstance.post<CreateRecipeResponse>(
        '/api/v1/recipes',
        formData
      );
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 400);
    }
  },

  /** Lấy chi tiết công thức theo id (phục vụ trang chỉnh sửa). */
  async getById(id: number): Promise<RecipeDto> {
    try {
      const response = await axiosInstance.get<RecipeDto>(`/api/v1/recipes/${id}`);
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 404);
    }
  },

  /** Lấy danh sách công thức của người dùng hiện tại. */
  async getMyRecipes(): Promise<RecipeDto[]> {
    try {
      const response = await axiosInstance.get<RecipeDto[]>('/api/v1/recipes/my');
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 401);
    }
  },

  /** Cập nhật công thức, có thể kèm ảnh mới. */
  async updateRecipe(id: number, data: UpdateRecipeRequest): Promise<UpdateRecipeResponse> {
    try {
      const formData = buildRecipeFormData(data);
      const response = await axiosInstance.put<UpdateRecipeResponse>(
        `/api/v1/recipes/${id}`,
        formData
      );
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 400);
    }
  },

  /** Chuyển trạng thái Draft -> Published -> Archived/Deleted. */
  async changeStatus(id: number, status: RecipeStatus): Promise<ChangeStatusResponse> {
    try {
      const response = await axiosInstance.patch<ChangeStatusResponse>(
        `/api/v1/recipes/${id}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 400);
    }
  },

  /** Xóa mềm công thức (chuyển sang trạng thái Deleted). */
  async deleteRecipe(id: number): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete<{ message: string }>(
        `/api/v1/recipes/${id}`
      );
      return response.data;
    } catch (error) {
      throw new ApiError(extractAxiosErrorMessage(error), 400);
    }
  },
};

/** Chuyển dữ liệu form sang FormData (dùng chung cho thêm mới và cập nhật). */
function buildRecipeFormData(data: RecipeFormValues & { imageFile?: File | null }) {
  const formData = new FormData();
  formData.append('Title', data.title);
  formData.append('Description', data.description);
  formData.append('Slug', data.slug);
  formData.append('PrepTimeMinutes', String(data.prepTimeMinutes));
  formData.append('CookTimeMinutes', String(data.cookTimeMinutes));
  formData.append('Servings', String(data.servings));
  formData.append('Difficulty', data.difficulty);
  formData.append('CategoryName', data.categoryName);
  if (data.instructions) formData.append('Instructions', data.instructions);
  if (data.imageFile) formData.append('imageFile', data.imageFile);
  return formData;
}

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
