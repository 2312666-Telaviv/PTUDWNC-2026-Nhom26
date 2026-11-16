import { getMockCategories } from '@/lib/mock/categories';
import type { CategoryDto } from '@/types/category';

// Lấy danh mục cho form tạo/sửa công thức.
// Mock mode dùng dữ liệu mẫu; nếu backend chưa có endpoint categories thì fallback về mock.
export async function getCategories(): Promise<CategoryDto[]> {
  if (process.env.USE_MOCK_API === 'true') {
    return getMockCategories();
  }

  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return getMockCategories();
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/categories`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Lỗi khi tải danh mục: ${response.status}`);
    }
    return (await response.json()) as CategoryDto[];
  } catch {
    return getMockCategories();
  }
}
