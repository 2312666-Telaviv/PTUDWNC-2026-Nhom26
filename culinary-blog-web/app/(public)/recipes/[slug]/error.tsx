'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function RecipeError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Không thể tải công thức</h1>
      <p className="mt-2 text-gray-600">
        Đã có lỗi xảy ra trong quá trình tải dữ liệu công thức. Vui lòng thử lại.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className="btn btn-primary">
          Thử lại
        </button>
        <Link href="/recipes" className="btn btn-outline">
          Về danh sách công thức
        </Link>
      </div>
    </div>
  );
}
