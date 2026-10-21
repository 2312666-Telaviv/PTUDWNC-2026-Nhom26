import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlogComments } from '@/components/blog/BlogComments';
import { CoverImage } from '@/components/blog/CoverImage';
import { AuthStoreHydration } from '@/components/auth/AuthStoreHydration';
import {
  getMockBlogCommentsByPostId,
  getMockBlogPostBySlug,
  mockBlogPosts,
} from '@/lib/mock/blog-posts';
import { formatDate, formatNumber } from '@/lib/utils/format';

interface BlogPostDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/** Tạo trang tĩnh cho toàn bộ bài viết trong dữ liệu giả */
export function generateStaticParams() {
  return mockBlogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getMockBlogPostBySlug(slug);

  if (!post) {
    return { title: 'Bài viết' };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
      locale: 'vi_VN',
      type: 'article',
    },
  };
}

/**
 * Trang chi tiết bài viết (/blog/[slug]) - giao diện tĩnh dùng dữ liệu giả.
 * TODO: khi có API thật, thay getMockBlogPostBySlug bằng lớp gọi API của nhóm.
 */
export default async function BlogPostDetailPage({ params }: BlogPostDetailPageProps) {
  const { slug } = await params;
  const post = getMockBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const comments = getMockBlogCommentsByPostId(post.id);
  const authorInitial = post.author.name.trim().charAt(0).toUpperCase();

  return (
    <div className="bg-orange-50/30">
      <article className="mx-auto max-w-3xl px-4 py-8">
        <AuthStoreHydration />

        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/blog" className="transition hover:text-orange-600">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{post.title}</span>
        </nav>

        <header>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700"
              >
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{post.title}</h1>
          <p className="mt-3 text-lg text-gray-600">{post.excerpt}</p>

          <div className="mt-5 flex flex-wrap items-center gap-4 border-y border-orange-100 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-sm font-medium text-white">
                {authorInitial}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{post.author.name}</p>
                <p className="text-xs text-gray-500">{post.author.role}</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <p>Đăng ngày {formatDate(post.publishedAt)}</p>
              <p>
                {post.readingMinutes} phút đọc - {formatNumber(post.viewCount)} lượt xem
              </p>
            </div>
            <Link
              href={`/blog/${post.slug}/edit`}
              className="btn btn-outline ml-auto text-sm"
            >
              Sửa bài viết
            </Link>
          </div>
        </header>

        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-lg border border-orange-100 bg-white">
          <CoverImage
            src={post.coverImageUrl}
            alt={post.title}
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>

        <div className="mt-8 space-y-4">
          {post.content.map((paragraph, index) => (
            <p key={index} className="text-base leading-7 text-gray-700">
              {paragraph}
            </p>
          ))}
        </div>

        <BlogComments postId={post.id} initialComments={comments} />
      </article>
    </div>
  );
}
