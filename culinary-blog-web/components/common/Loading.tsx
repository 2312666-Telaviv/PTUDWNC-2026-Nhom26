interface LoadingProps {
  label?: string;
  fullPage?: boolean;
}

export function Loading({ label = 'Đang tải...', fullPage = false }: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 text-gray-600 ${
        fullPage ? 'min-h-[50vh]' : 'py-8'
      }`}
    >
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}