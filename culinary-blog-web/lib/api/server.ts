import { notFound } from 'next/navigation';
import { PaginatedResult, RecipeDto, RecipeListDto } from '@/types/api';
import { CategoryDto } from '@/types/category';
import { getMockCategories } from '@/lib/mock/categories';
import { getMockRecipeBySlug, getMockRecipes } from '@/lib/mock/recipes';

const API_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5041').replace(/\/$/, '');
const API_BASE_URL = `${API_URL}/api/v1`;
const USE_MOCK_API = process.env.USE_MOCK_API === 'true';

interface GetListParams {
  page?: number;
  pageSize?: number;
  categoryId?: number | null;
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

export const recipeApi = {
  async getList(params: GetListParams = {}): Promise<PaginatedResult<RecipeListDto>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 12;
    const categoryId = params.categoryId;

    if (USE_MOCK_API) {
      try {
        const allRecipes = getMockRecipes();
        let filtered = allRecipes;

        if (categoryId) {
          const recipeDtos = await import('@/lib/mock/recipes').then((m) =>
            m.mockRecipes.filter((r) => r.categoryId === categoryId)
          );
          filtered = recipeDtos.map((recipe) => ({
            id: recipe.id,
            title: recipe.title,
            slug: recipe.slug,
            description: recipe.description,
            totalTime: recipe.totalTime,
            servings: recipe.servings,
            difficulty: recipe.difficulty,
            categoryName: recipe.categoryName,
            primaryImageUrl: recipe.primaryImageUrl,
            viewCount: recipe.viewCount,
            createdAt: recipe.createdAt,
          }));
        }

        const totalCount = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const startIndex = (page - 1) * pageSize;
        const items = filtered.slice(startIndex, startIndex + pageSize);

        return {
          items,
          totalCount,
          pageNumber: page,
          pageSize,
          totalPages,
        };
      } catch (error) {
        console.error('Lỗi khi trả về mock dữ liệu:', error);
        throw error;
      }
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
      console.warn('Gọi API thất bại, chuyển sang dùng mock dữ liệu:', error);
      const allRecipes = getMockRecipes();
      let filtered = allRecipes;

      if (categoryId) {
        const recipeDtos = (await import('@/lib/mock/recipes')).mockRecipes.filter(
          (r) => r.categoryId === categoryId
        );
        filtered = recipeDtos.map((recipe) => ({
          id: recipe.id,
          title: recipe.title,
          slug: recipe.slug,
          description: recipe.description,
          totalTime: recipe.totalTime,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          categoryName: recipe.categoryName,
          primaryImageUrl: recipe.primaryImageUrl,
          viewCount: recipe.viewCount,
          createdAt: recipe.createdAt,
        }));
      }

      const totalCount = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const startIndex = (page - 1) * pageSize;
      const items = filtered.slice(startIndex, startIndex + pageSize);

      return {
        items,
        totalCount,
        pageNumber: page,
        pageSize,
        totalPages,
      };
    }
  },

  async getLatest(limit = 6): Promise<RecipeListDto[]> {
    if (USE_MOCK_API) {
      return [...getMockRecipes()]
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

  async getBySlug(slug: string): Promise<RecipeDto> {
    if (USE_MOCK_API) {
      const recipe = getMockRecipeBySlug(slug);
      if (!recipe) {
        notFound();
      }
      return recipe;
    }

    try {
      const data = await fetchFromApi<RecipeDto>(`/recipes/${slug}`);
      return data;
    } catch (error) {
      console.warn('Gọi API thất bại, chuyển sang dùng mock dữ liệu:', error);
      const recipe = getMockRecipeBySlug(slug);
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
