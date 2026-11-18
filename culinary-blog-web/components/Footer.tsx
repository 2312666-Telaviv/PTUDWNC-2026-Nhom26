import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-orange-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold text-orange-600">Culinary Blog</p>
          <p className="mt-1 text-sm text-gray-600">
            Chia sẻ công thức nấu ăn Việt Nam.
          </p>
        </div>
        <nav className="flex items-center gap-6 text-sm text-gray-700">
          <Link href="/" className="transition hover:text-orange-600">
            Trang chủ
          </Link>
          <Link href="/recipes" className="transition hover:text-orange-600">
            Công thức
          </Link>
          <Link href="/blog" className="transition hover:text-orange-600">
            Blog
          </Link>
        </nav>
      </div>
      <div className="border-t border-orange-100 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Culinary Blog. Nhóm 26 - Phát triển ứng dụng web nâng cao.
      </div>
    </footer>
  );
}