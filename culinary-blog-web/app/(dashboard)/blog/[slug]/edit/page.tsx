import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostForm } from '@/components/blog/PostForm';
import { getMockBlogPostBySlug } from '@/lib/mock/blog-posts';

interface EditBlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: EditBlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getMockBlogPostBySlug(slug);

  return {
    title: post ? `Sửa: ${post.title}` : 'Sửa bài viết',
  };
}

/**
 * Màn hình chỉnh sửa bài viết (/blog/[slug]/edit).
 * TODO: khi có API thật, nối form với PUT /api/v1/posts/{id} và tải bài viết từ API.
 */
export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { slug } = await params;
  const post = getMockBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa bài viết</h1>
        <p className="mt-1 text-gray-600">Cập nhật nội dung của bài viết: {post.title}</p>
      </div>

      <PostForm mode="edit" initialPost={post} />
    </div>
  );
}
