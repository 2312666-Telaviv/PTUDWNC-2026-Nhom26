import Link from 'next/link';

export default function RecipeNotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
      <p className="text-6xl font-bold text-orange-500">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">
        Không tìm thấy công thức
      </h1>
      <p className="mt-2 text-gray-600">
        Công thức bạn đang tìm có thể đã bị xoá hoặc đường dẫn không đúng.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/recipes" className="btn btn-primary">
          Xem danh sách công thức
        </Link>
        <Link href="/" className="btn btn-outline">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
