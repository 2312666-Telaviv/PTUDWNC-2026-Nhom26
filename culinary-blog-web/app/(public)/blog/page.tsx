import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogExplorer } from '@/components/blog/BlogExplorer';
import { getMockBlogPosts, getMockBlogTags } from '@/lib/mock/blog-posts';

export const metadata: Metadata = {
  title: 'Trang chủ',
  description: 'Blog chia sẻ kinh nghiệm nấu ăn Việt Nam, mẹo vặt và công thức mới mỗi ngày',
};

/**
 * Trang chủ của blog app (/blog) - giao diện tĩnh dùng dữ liệu giả.
 * TODO: khi có API thật, thay getMockBlogPosts/getMockBlogTags bằng lớp gọi API
 * của nhóm (phần 1 & 2).
 */
export default function BlogHomePage() {
  const posts = getMockBlogPosts();
  const tags = getMockBlogTags();

  return (
    <div className="bg-orange-50/30">
      <section className="border-b border-orange-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange-600">
            Culinary Blog
          </p>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Chào mừng đến với blog ẩm thực
          </h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            Nơi chia sẻ công thức nấu ăn, mẹo vặt và những bí quyết giúp bữa cơm gia đình thêm
            ngon miệng mỗi ngày.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/blog/new" className="btn btn-primary">
              Viết bài viết
            </Link>
            <Link href="/blog/login" className="btn btn-outline">
              Đăng nhập
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Bài viết mới nhất</h2>
          <span className="text-sm text-gray-500">Tổng cộng {posts.length} bài viết</span>
        </div>

        <BlogExplorer posts={posts} tags={tags} />

        {/* TODO: thay khối phân trang tĩnh bên dưới bằng component Pagination
            dùng chung của nhóm (phần 5 & 6) khi có API phân trang thật. */}
        <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Phân trang">
          <span className="cursor-not-allowed rounded-md border border-orange-200 px-4 py-2 text-orange-300">
            Trước
          </span>
          <span className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white">1</span>
          <span className="rounded-md border border-orange-200 px-4 py-2 text-orange-600">2</span>
          <span className="rounded-md border border-orange-200 px-4 py-2 text-orange-600">3</span>
          <span className="rounded-md border border-orange-200 px-4 py-2 text-orange-700 transition hover:bg-orange-50">
            Sau
          </span>
        </nav>
      </section>
    </div>
  );
}
