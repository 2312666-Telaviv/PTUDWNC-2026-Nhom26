'use client';

import { useMemo, useState } from 'react';
import { PostCard } from '@/components/blog/PostCard';
import { BlogPost, BlogTag } from '@/types/blog';

interface BlogExplorerProps {
  posts: BlogPost[];
  tags: BlogTag[];
}

/**
 * Vùng tìm kiếm và lọc bài viết theo tag (chạy hoàn toàn phía client với dữ liệu giả).
 * TODO: khi có API thật, chuyển việc lọc/tìm kiếm lên server và truyền
 * query string (keyword, tag) xuống trang chủ.
 */
export function BlogExplorer({ posts, tags }: BlogExplorerProps) {
  const [keyword, setKeyword] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesTag = activeTag === null || post.tags.includes(activeTag);

      if (!normalized) {
        return matchesTag;
      }

      const matchesKeyword =
        post.title.toLowerCase().includes(normalized) ||
        post.excerpt.toLowerCase().includes(normalized) ||
        post.author.name.toLowerCase().includes(normalized) ||
        post.tags.some((tag) => tag.toLowerCase().includes(normalized));

      return matchesTag && matchesKeyword;
    });
  }, [posts, keyword, activeTag]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-orange-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label htmlFor="blog-search" className="sr-only">
            Tìm kiếm bài viết
          </label>
          <input
            id="blog-search"
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm bài viết theo tiêu đề, tác giả hoặc tag..."
            className="input flex-1"
          />
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={activeTag === null ? 'btn btn-primary' : 'btn btn-outline'}
          >
            Tất cả
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isActive = activeTag === tag.name;
            return (
              <button
                key={tag.name}
                type="button"
                onClick={() => setActiveTag(isActive ? null : tag.name)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                }`}
              >
                #{tag.name} ({tag.count})
              </button>
            );
          })}
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-500">
        Tìm thấy <span className="font-semibold text-gray-800">{filteredPosts.length}</span> bài viết
      </p>

      {filteredPosts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-orange-200 bg-white p-10 text-center">
          <p className="mb-2 text-lg font-semibold text-gray-800">Không tìm thấy bài viết nào</p>
          <p className="text-sm text-gray-500">
            Thử từ khoá khác hoặc bỏ chọn tag để xem tất cả bài viết.
          </p>
          <button
            type="button"
            onClick={() => {
              setKeyword('');
              setActiveTag(null);
            }}
            className="btn btn-outline mt-4"
          >
            Xoá bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post, index) => (
            <PostCard key={post.id} post={post} priority={index < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
