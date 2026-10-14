import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';

// Định nghĩa kiểu dữ liệu cơ bản (có thể điều chỉnh lại theo model thực tế của nhóm)
export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

// 1. Hook lấy danh sách công thức: useRecipes()
export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const response = await axiosInstance.get<Recipe[]>('/recipes');
      return response.data;
    },
  });
}

// 2. Hook lấy chi tiết một công thức theo slug: useRecipe(slug)
export function useRecipe(slug: string) {
  return useQuery({
    queryKey: ['recipe', slug],
    queryFn: async () => {
      const response = await axiosInstance.get<Recipe>(`/recipes/${slug}`);
      return response.data;
    },
    enabled: !!slug, // Chỉ chạy query khi có slug hợp lệ
  });
}

// 3. Hook phân trang cuộn vô tận cho phần bình luận: useInfiniteComments(recipeId)
export function useInfiniteComments(recipeId: string) {
  return useInfiniteQuery({
    queryKey: ['comments', recipeId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosInstance.get<{ items: Comment[]; nextPage?: number }>(
        `/recipes/${recipeId}/comments?page=${pageParam}&pageSize=10`
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    enabled: !!recipeId,
  });
}