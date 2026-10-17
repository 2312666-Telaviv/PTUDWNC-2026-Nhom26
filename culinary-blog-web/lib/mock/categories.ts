export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
}

// Danh mục mẫu với id dạng UUID hợp lệ (để thoả mãn .uuid() trong schema)
export const mockCategories: CategoryDto[] = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Món chính', slug: 'mon-chinh' },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Món nhẹ', slug: 'mon-nhe' },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Khai vị', slug: 'khai-vi' },
  { id: '44444444-4444-4444-8444-444444444444', name: 'Tráng miệng', slug: 'trang-mieng' },
  { id: '55555555-5555-4555-8555-555555555555', name: 'Đồ uống', slug: 'do-uong' },
];

export function getMockCategories(): CategoryDto[] {
  return mockCategories;
}
