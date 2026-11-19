import { notFound } from 'next/navigation';
import { PaginatedResult, RecipeDto, RecipeListDto } from '@/types/api';
import { CategoryDto } from '@/types/category';
import { getMockCategories } from '@/lib/mock/categories';
import {
  getPublishedRecipeBySlug,
  getRecipeById,
  listPublishedRecipes,
  paginateRecipeList,
} from '@/lib/mock/recipe-store';

const API_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5041').replace(/\/$/, '');
const API_BASE_URL = `${API_URL}/api/v1`;
const USE_MOCK_API = process.env.USE_MOCK_API === 'true';

interface GetListParams {
  page?: number;
  pageSize?: number;
  categoryId?: number | null;
}

interface GetRecipeOptions {
  includeUnpublished?: boolean;
}

async function fetchFromApi<T>(endpoint: string): Promise<T> {
  if (!API_URL) {
    throw new Error('API_URL không được cấu hình');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Lỗi khi gọi API: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function getMockList(params: GetListParams = {}): PaginatedResult<RecipeListDto> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;

  // listPublishedRecipes đã lọc status = Published nên Draft/Archived/Deleted
  // không bao giờ lộ ra các trang công khai.
  const recipes = listPublishedRecipes({ categoryId: params.categoryId });
  return paginateRecipeList(recipes, page, pageSize);
}

export const recipeApi = {
  async getList(params: GetListParams = {}): Promise<PaginatedResult<RecipeListDto>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 12;
    const categoryId = params.categoryId;

    if (USE_MOCK_API) {
      return getMockList({ page, pageSize, categoryId });
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('pageNumber', page.toString());
      queryParams.append('pageSize', pageSize.toString());
      if (categoryId) {
        queryParams.append('categoryId', categoryId.toString());
      }

      const data = await fetchFromApi<PaginatedResult<RecipeListDto>>(
        `/recipes?${queryParams.toString()}`
      );
      return data;
    } catch (error) {
      console.warn('Gọi API thật bại, chuyển sang dùng mock dữ liệu:', error);
      return getMockList({ page, pageSize, categoryId });
    }
  },

  async getLatest(limit = 6): Promise<RecipeListDto[]> {
    if (USE_MOCK_API) {
      return [...listPublishedRecipes()]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    }

    const result = await recipeApi.getList({ page: 1, pageSize: limit });
    if (!Array.isArray(result.items)) {
      throw new Error('Phản hồi API công thức không đúng định dạng danh sách có phân trang');
    }

    return [...result.items]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  // Trang công khai chỉ được xem công thức Published.
  async getBySlug(slug: string): Promise<RecipeDto> {
    if (USE_MOCK_API) {
      const recipe = getPublishedRecipeBySlug(slug);
      if (!recipe) {
        notFound();
      }
      return recipe;
    }

    try {
      const data = await fetchFromApi<RecipeDto>(`/recipes/${slug}`);
      return data;
    } catch (error) {
      console.warn('Gọi API thật bại, chuyển sang dùng mock dữ liệu:', error);
      const recipe = getPublishedRecipeBySlug(slug);
      if (!recipe) {
        notFound();
      }
      return recipe;
    }
  },

  // Trang quản lý (edit) cần xem được cả Draft/Archived.
  async getById(id: number, options: GetRecipeOptions = {}): Promise<RecipeDto> {
    if (USE_MOCK_API) {
      const recipe = getRecipeById(id, options);
      if (!recipe) {
        notFound();
      }
      return recipe;
    }

    try {
      const data = await fetchFromApi<RecipeDto>(`/recipes/${id}`);
      return data;
    } catch (error) {
      console.warn('Gọi API thật bại, chuyển sang dùng mock dữ liệu:', error);
      const recipe = getRecipeById(id, options);
      if (!recipe) {
        notFound();
      }
      return recipe;
    }
  },
};

export const categoryApi = {
  async getList(): Promise<CategoryDto[]> {
    // Backend .NET hiện chưa có entity/controller Category nên chưa có endpoint
    // danh sách danh mục. Trong lúc chờ backend, dùng dữ liệu mock của dự án.
    // Khi backend bổ sung GET /api/v1/categories, thay phần thân hàm này bằng
    // fetchFromApi<CategoryDto[]>('/categories').
    return getMockCategories();
  },
};
