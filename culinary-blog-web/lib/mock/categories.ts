import type { CategoryDto } from '@/types/category';
import { slugify } from '@/lib/utils/slugify';

export type { CategoryDto };

// Danh mục mẫu với id dạng UUID hợp lệ (để thoả mãn .uuid() trong schema).
// Slug luôn được sinh từ tên bằng cùng một hàm slugify để link và tra cứu khớp nhau.
const categorySeeds: Array<Pick<CategoryDto, 'id' | 'name'>> = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Món chính' },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Món nhẹ' },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Khai vị' },
  { id: '44444444-4444-4444-8444-444444444444', name: 'Tráng miệng' },
  { id: '55555555-5555-4555-8555-555555555555', name: 'Đồ uống' },
];

export const mockCategories: CategoryDto[] = categorySeeds.map((category) => ({
  ...category,
  slug: slugify(category.name),
}));

export function getMockCategories(): CategoryDto[] {
  return mockCategories;
}
