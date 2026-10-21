'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useInfiniteComments } from '@/hooks/useComments';
import { recipeKeys } from '@/hooks/useRecipes';
import apiClient from '@/lib/api/axios';

export function CommentSection({ recipeId }: { recipeId: number }) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteComments(recipeId);

  const comments = data?.pages.flatMap((page) => page.items) || [];

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiClient.post('/comments', { recipeId, content });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.comments(recipeId) });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const content = formData.get('content') as string;
    if (!content?.trim()) return;
    addCommentMutation.mutate(content);
    form.reset();
  };

  return (
    <section className="mx-auto max-w-4xl px-4 pb-8">
      <h2 className="mb-4 text-2xl font-semibold text-gray-900">Bình luận</h2>

      {status === 'loading' && (
        <div className="mb-4 h-20 animate-pulse rounded bg-gray-200" />
      )}

      {status !== 'loading' && !session && (
        <div className="mb-4 rounded-md bg-orange-50 p-4 text-gray-700">
          <Link href="/login" className="text-orange-600 hover:underline">
            Đăng nhập để bình luận
          </Link>
        </div>
      )}

      {session && (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            name="content"
            rows={3}
            placeholder="Viết bình luận của bạn..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={addCommentMutation.isPending}
            className="mt-2 rounded-md bg-orange-600 px-4 py-2 text-white transition hover:bg-orange-700 disabled:opacity-50"
          >
            {addCommentMutation.isPending ? 'Đang gửi...' : 'Gửi bình luận'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded bg-gray-200" />
          <div className="h-16 animate-pulse rounded bg-gray-200" />
          <div className="h-16 animate-pulse rounded bg-gray-200" />
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-md border border-gray-200 p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium text-gray-900">{comment.authorName}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="py-4 text-center text-gray-500">Chưa có bình luận nào.</p>
          )}
        </div>
      )}

      {hasNextPage && (
        <div className="mt-4 text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-md border border-orange-300 px-4 py-2 text-orange-700 transition hover:bg-orange-50 disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm bình luận'}
          </button>
        </div>
      )}
    </section>
  );
}
