'use client';

import { useRouter } from 'next/navigation';

interface ErrorStateProps {
  title?: string;
  description?: string;
}

export function ErrorState({
  title = 'Không thể tải dữ liệu',
  description = 'Đã có lỗi xảy ra trong quá trình tải dữ liệu. Vui lòng thử lại.',
}: ErrorStateProps) {
  const router = useRouter();

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center" role="alert">
      <p className="text-base font-semibold text-red-700">{title}</p>
      <p className="mt-1 text-sm text-red-600">{description}</p>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="mt-4 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
      >
        Thử lại
      </button>
    </div>
  );
}
