// Model người dùng tối thiểu, dùng cho auth-store và các màn hình đăng nhập/đăng ký.
// TODO: khi tích hợp API thật, map từ LoginResponseDto (types/api.ts) sang User này
// trong lớp tiện ích gọi API của thành viên phụ trách phần 1 & 2.
export interface User {
  // Định danh người dùng (backend dạng GUID)
  id: string;
  email: string;
  // Tên hiển thị (họ tên hoặc nickname)
  name: string;
  // Ảnh đại diện, có thể chưa có
  avatarUrl?: string | null;
  // Danh sách quyền: 'Admin' | 'User' (khớp với role phía backend)
  roles?: string[];
  // Thông tin bổ sung cho hồ sơ
  phone?: string | null;
  bio?: string | null;
}
