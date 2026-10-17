'use client';

export function CommentSection({ recipeId }: { recipeId: number }) {
  void recipeId;
  return (
    <section className="mx-auto max-w-4xl px-4 pb-8">
      <h2 className="mb-4 text-2xl font-semibold text-gray-900">Bình luận</h2>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
        Bình luận (sẽ hoàn thiện ở Bài 2)
      </div>
    </section>
  );
}
