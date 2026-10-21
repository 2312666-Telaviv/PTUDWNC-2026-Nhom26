import { Metadata } from 'next';
import { CreateRecipeForm } from '@/components/forms/CreateRecipeForm';
import { CategoryDto, getMockCategories } from '@/lib/mock/categories';

export const metadata: Metadata = {
  title: 'Đăng công thức mới',
};

// Lấy danh mục: dùng mock khi bật chế độ mock, ngược lại gọi backend .NET
async function getCategories(): Promise<CategoryDto[]> {
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
    // Fallback về mock nếu backend chưa chạy
    return getMockCategories();
  }
}

export default async function NewRecipePage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Đăng công thức mới</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <CreateRecipeForm categories={categories} />
      </div>
    </div>
  );
}
