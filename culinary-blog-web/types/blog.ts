// Các kiểu dữ liệu tối giản cho giao diện tĩnh của blog app (Lab 6 - Phần 4).
// TODO: khi tích hợp API thật, thay các kiểu này bằng DTO do lớp tiện ích gọi API
// (phần 1 & 2) cung cấp, giữ nguyên tên trường để không phải sửa lại giao diện.

/** Tác giả của bài viết */
export interface BlogAuthor {
  id: string;
  name: string;
  avatarUrl?: string | null;
  // Vai trò hiển thị dưới tên tác giả (vd: "Chef Hà Nội")
  role?: string;
}

/** Một bài viết trong blog */
export interface BlogPost {
  id: string;
  // Dùng để tạo đường dẫn /blog/[slug]
  slug: string;
  title: string;
  // Mô tả ngắn hiển thị trên card ở trang chủ
  excerpt: string;
  // Ảnh bìa của bài viết
  coverImageUrl: string;
  author: BlogAuthor;
  // Ngày đăng theo chuẩn ISO
  publishedAt: string;
  // Các tag của bài viết, dùng để lọc ở trang chủ
  tags: string[];
  // Nội dung bài viết: mỗi phần tử là một đoạn văn
  content: string[];
  // Số phút đọc ước tính
  readingMinutes: number;
  viewCount: number;
}

/** Một bình luận của bài viết */
export interface BlogComment {
  id: string;
  // Khóa chính của bài viết, dùng để lọc danh sách bình luận
  postId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  content: string;
  createdAt: string;
}

/** Tag kèm số lượng bài viết, dùng cho vùng lọc theo tag */
export interface BlogTag {
  name: string;
  count: number;
}
