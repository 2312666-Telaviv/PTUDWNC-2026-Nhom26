import type { Metadata } from 'next';
import { PostForm } from '@/components/blog/PostForm';

export const metadata: Metadata = {
  title: 'Viết bài viết mới',
  description: 'Soạn thảo và đăng bài viết mới trên Culinary Blog',
};

/**
 * Màn hình tạo bài viết mới (/blog/new).
 * TODO: khi có API thật, nối form với POST /api/v1/posts và chuyển hướng
 * về trang chi tiết của bài vừa tạo.
 */
export default function NewBlogPostPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Viết bài viết mới</h1>
        <p className="mt-1 text-gray-600">
          Chia sẻ công thức, mẹo nấu ăn hoặc kinh nghiệm của bạn với cộng đồng.
        </p>
      </div>

      <PostForm mode="create" />
    </div>
  );
}
