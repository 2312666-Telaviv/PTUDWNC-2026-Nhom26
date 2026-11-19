export type UserRole = 'Admin' | 'Author';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  recipeCount: number;
  createdAt: string;
}

// TODO: thay bằng API thật khi backend có endpoint danh sách người dùng.
export const mockUsers: UserSummary[] = [
  { id: 'u-001', name: 'Quản trị hệ thống', email: 'admin@example.com', role: 'Admin', recipeCount: 0, createdAt: '2026-09-01T08:00:00Z' },
  { id: 'u-002', name: 'Nguyễn Thị Lan', email: 'lan.nguyen@example.com', role: 'Author', recipeCount: 12, createdAt: '2026-09-05T09:30:00Z' },
  { id: 'u-003', name: 'Trần Văn Minh', email: 'minh.tran@example.com', role: 'Author', recipeCount: 8, createdAt: '2026-09-12T14:15:00Z' },
  { id: 'u-004', name: 'Lê Hoàng Anh', email: 'anh.le@example.com', role: 'Author', recipeCount: 5, createdAt: '2026-09-20T10:45:00Z' },
  { id: 'u-005', name: 'Phạm Thu Hà', email: 'ha.pham@example.com', role: 'Author', recipeCount: 21, createdAt: '2026-10-02T16:20:00Z' },
  { id: 'u-006', name: 'Võ Quốc Bảo', email: 'bao.vo@example.com', role: 'Author', recipeCount: 3, createdAt: '2026-10-15T11:00:00Z' },
  { id: 'u-007', name: 'Đặng Mai Phương', email: 'phuong.dang@example.com', role: 'Admin', recipeCount: 2, createdAt: '2026-10-28T13:10:00Z' },
];
