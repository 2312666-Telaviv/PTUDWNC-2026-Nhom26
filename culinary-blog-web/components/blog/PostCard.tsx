import Link from 'next/link';
import { CoverImage } from '@/components/blog/CoverImage';
import { formatDate, formatNumber } from '@/lib/utils/format';
import { BlogPost } from '@/types/blog';

interface PostCardProps {
  post: BlogPost;
  /** Ưu tiên tải ảnh cho các card nằm trên đầu trang */
  priority?: boolean;
}

/** Thẻ hiển thị một bài viết trong lưới bài viết ở trang chủ /blog */
export function PostCard({ post, priority = false }: PostCardProps) {
  const authorInitial = post.author.name.trim().charAt(0).toUpperCase();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-orange-100 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <CoverImage
            src={post.coverImageUrl}
            alt={post.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700"
            >
              #{tag}
            </span>
          ))}
        </div>

        <h3 className="mb-1 text-lg font-semibold text-gray-900">
          <Link href={`/blog/${post.slug}`} className="transition hover:text-orange-600">
            {post.title}
          </Link>
        </h3>

        <p className="mb-4 line-clamp-3 text-sm text-gray-600">{post.excerpt}</p>

        <div className="mt-auto flex items-center justify-between border-t border-orange-50 pt-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-sm font-medium text-white">
              {authorInitial}
            </div>
            <div className="text-xs">
              <p className="font-medium text-gray-800">{post.author.name}</p>
              <p className="text-gray-400">{formatDate(post.publishedAt)}</p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>{post.readingMinutes} phút đọc</p>
            <p>{formatNumber(post.viewCount)} lượt xem</p>
          </div>
        </div>
      </div>
    </article>
  );
}
