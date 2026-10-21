import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-orange-50 px-4">
      <h1 className="mb-4 text-6xl font-bold text-orange-600">404</h1>
      <h2 className="mb-4 text-2xl font-semibold text-gray-900">Không tìm thấy trang</h2>
      <p className="mb-8 text-center text-gray-600">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link
        href="/"
        className="rounded-md bg-orange-600 px-6 py-3 font-medium text-white transition hover:bg-orange-700"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
