import Link from 'next/link';

const quickLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/recipes', label: 'Công thức' },
  { href: '/blog', label: 'Blog ẩm thực' },
  { href: '/recipes/search', label: 'Tìm kiếm' },
];

const accountLinks = [
  { href: '/login', label: 'Đăng nhập' },
  { href: '/register', label: 'Đăng ký' },
  { href: '/profile', label: 'Hồ sơ cá nhân' },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-orange-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Link href="/" className="text-xl font-bold text-orange-600">
            Culinary Blog
          </Link>
          <p className="mt-3 max-w-md text-sm leading-6 text-gray-600">
            Blog chia sẻ công thức nấu ăn Việt Nam - nơi lưu giữ hương vị truyền thống và kết nối
            những người yêu bếp.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Đồ án Phát triển ứng dụng Web nâng cao - Nhóm 26.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            Liên kết nhanh
          </h2>
          <ul className="mt-3 space-y-2">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-600 transition hover:text-orange-600"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            Tài khoản
          </h2>
          <ul className="mt-3 space-y-2">
            {accountLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-600 transition hover:text-orange-600"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-orange-100">
        <p className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Culinary Blog - Nhóm 26. Bảo lưu mọi quyền.
        </p>
      </div>
    </footer>
  );
}
