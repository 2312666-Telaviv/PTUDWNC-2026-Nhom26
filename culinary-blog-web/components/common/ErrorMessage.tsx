'use client';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  title = 'Đã có lỗi xảy ra',
  message = 'Vui lòng thử lại sau ít phút.',
  onRetry,
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="mx-auto my-12 max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center"
    >
      <h2 className="text-lg font-semibold text-red-700">{title}</h2>
      <p className="mt-2 text-sm text-red-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}
