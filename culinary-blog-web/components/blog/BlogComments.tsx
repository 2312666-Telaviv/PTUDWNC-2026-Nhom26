'use client';

import { FormEvent, useState } from 'react';
import { useAuthUser } from '@/store/auth-store';
import { formatDateTime } from '@/lib/utils/format';
import { BlogComment } from '@/types/blog';

interface BlogCommentsProps {
  postId: string;
  initialComments: BlogComment[];
}

/**
 * Khu vực bình luận của bài viết: hiển thị danh sách bình luận và form gửi bình luận mới.
 * Dùng auth-store để lấy tên người dùng đang đăng nhập (nếu có).
 * TODO: khi có API thật, danh sách bình luận sẽ lấy từ server và form sẽ POST
 * lên endpoint bình luận thay vì thêm cục bộ.
 */
export function BlogComments({ postId, initialComments }: BlogCommentsProps) {
  const [comments, setComments] = useState<BlogComment[]>(initialComments);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const currentUser = useAuthUser();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) {
      setError('Vui lòng nhập nội dung bình luận.');
      return;
    }

    const newComment: BlogComment = {
      id: `local-${postId}-${comments.length + 1}`,
      postId,
      authorName: currentUser?.name ?? 'Ẩn danh',
      authorAvatarUrl: currentUser?.avatarUrl ?? null,
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setComments((previous) => [newComment, ...previous]);
    setContent('');
    setError(null);
  };

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-bold text-gray-900">
        Bình luận ({comments.length})
      </h2>

      <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-orange-100 bg-white p-4 shadow-sm">
        <label htmlFor="comment-content" className="form-label">
          Chia sẻ ý kiến của bạn
        </label>
        <textarea
          id="comment-content"
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            if (error) setError(null);
          }}
          placeholder="Bạn nghĩ gì về bài viết này?"
          className={error ? 'textarea input-error' : 'textarea'}
          rows={3}
        />
        {error && <p className="form-error">{error}</p>}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            {currentUser
              ? `Đang đăng nhập với tên ${currentUser.name}`
              : 'Bạn đang xem với tư cách khách, bình luận sẽ hiển thị tên Ẩn danh.'}
          </p>
          <button type="submit" className="btn btn-primary">
            Gửi bình luận
          </button>
        </div>
      </form>

      {comments.length === 0 ? (
        <p className="rounded-lg border border-dashed border-orange-200 bg-white p-6 text-center text-sm text-gray-500">
          Chưa có bình luận nào, hãy là người đầu tiên bình luận.
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => {
            const initial = comment.authorName.trim().charAt(0).toUpperCase();

            return (
              <li
                key={comment.id}
                className="flex gap-3 rounded-lg border border-orange-100 bg-white p-4 shadow-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-medium text-white">
                  {initial}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {comment.authorName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-gray-700">
                    {comment.content}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
