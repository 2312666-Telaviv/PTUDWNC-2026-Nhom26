import type { RecipeDto } from '@/types/api';

const base: RecipeDto[] = [
  {
    id: '1', title: 'Phở bò truyền thống Hà Nội', slug: 'pho-bo',
    description: 'Nước dùng ninh xương trong veo, thơm mùi quế hồi, bánh phở mềm dai.',
    primaryImageUrl: 'https://picsum.photos/seed/pho/800/450',
    prepTimeMinutes: 30, cookTimeMinutes: 180, servings: 4, difficulty: 'Hard',
    categoryName: 'Món chính', authorName: 'Admin', createdAt: '2026-09-01T00:00:00Z',
    likeCount: 12, isLiked: false,
    ingredients: [
      { id: 'i1', name: 'Xương bò', quantity: 1, unit: 'kg' },
      { id: 'i2', name: 'Bánh phở', quantity: 500, unit: 'g', notes: 'tươi' },
      { id: 'i3', name: 'Hành tây', quantity: 2, unit: 'củ' },
    ],
    steps: [
      { id: 's1', stepNumber: 1, description: 'Chần xương với nước sôi để loại bỏ bọt bẩn.', durationMinutes: 10 },
      { id: 's2', stepNumber: 2, description: 'Ninh xương cùng hành nướng, gừng nướng và gia vị.', durationMinutes: 180 },
    ],
  },
  {
    id: '2', title: 'Bánh mì thịt nướng', slug: 'banh-mi-thit-nuong',
    description: 'Thịt heo nướng thơm lừng kẹp bánh mì giòn, đồ chua và rau thơm.',
    primaryImageUrl: 'https://picsum.photos/seed/banhmi/800/450',
    prepTimeMinutes: 20, cookTimeMinutes: 25, servings: 2, difficulty: 'Easy',
    categoryName: 'Ăn nhanh', authorName: 'Admin', createdAt: '2026-09-02T00:00:00Z',
    likeCount: 5, isLiked: false,
    ingredients: [
      { id: 'i1', name: 'Thịt heo', quantity: 300, unit: 'g' },
      { id: 'i2', name: 'Bánh mì', quantity: 2, unit: 'ổ' },
    ],
    steps: [
      { id: 's1', stepNumber: 1, description: 'Ướp thịt với sả, tỏi, đường và nước mắm.', durationMinutes: 15 },
      { id: 's2', stepNumber: 2, description: 'Nướng thịt đến khi vàng đều hai mặt rồi kẹp bánh mì.', durationMinutes: 10 },
    ],
  },
  {
    id: '3', title: 'Canh chua cá lóc', slug: 'canh-chua-ca-loc',
    description: 'Vị chua thanh của me, thơm và cà chua, ăn kèm cơm trắng rất hợp.',
    primaryImageUrl: 'https://picsum.photos/seed/canhchua/800/450',
    prepTimeMinutes: 15, cookTimeMinutes: 20, servings: 4, difficulty: 'Medium',
    categoryName: 'Món canh', authorName: 'Admin', createdAt: '2026-09-03T00:00:00Z',
    likeCount: 8, isLiked: false,
    ingredients: [
      { id: 'i1', name: 'Cá lóc', quantity: 500, unit: 'g' },
      { id: 'i2', name: 'Me chua', quantity: 2, unit: 'tbsp' },
    ],
    steps: [
      { id: 's1', stepNumber: 1, description: 'Nấu nước me với thơm và cà chua.', durationMinutes: 10 },
      { id: 's2', stepNumber: 2, description: 'Cho cá vào nấu chín, nêm vừa ăn, thêm rau thơm.', durationMinutes: 10 },
    ],
  },
];

// Tạo 14 recipe để test phân trang
export const mockRecipes: RecipeDto[] = Array.from({ length: 14 }, (_, i) => {
  const r = base[i % 3];
  return i < 3 ? r : { ...r, id: String(i + 1), slug: `${r.slug}-${i + 1}` };
});