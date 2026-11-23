import Link from 'next/link';
import { UserMenu } from '@/components/UserMenu';
import { auth } from '@/lib/auth';

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/recipes', label: 'Công thức' },
  { href: '/categories', label: 'Danh mục' },
  { href: '/blog', label: 'Blog' },
];

export async function Header() {
  const session = await auth();
  const roles = session?.user?.roles ?? [];
  const isAdmin = session?.user?.role === 'Admin' || roles.includes('Admin');

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <Link href="/" className="shrink-0 text-xl font-bold text-orange-600">
          Culinary Blog
        </Link>

        <nav className="order-3 flex w-full items-center gap-5 text-sm font-medium text-gray-700 md:order-none md:w-auto md:text-base">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-orange-600">
              {link.label}
            </Link>
          ))}

          {isAdmin && (
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 transition hover:text-orange-600 [&::-webkit-details-marker]:hidden">
                Quản trị
                <span className="text-xs transition group-open:rotate-180">▾</span>
              </summary>
              <div className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-orange-100 bg-white py-1 shadow-lg shadow-orange-900/10">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-700"
                >
                  Bảng điều khiển
                </Link>
                <Link
                  href="/dashboard/users"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-700"
                >
                  Quản lý người dùng
                </Link>
              </div>
            </details>
          )}
        </nav>

        <form
          action="/recipes/search"
          method="get"
          className="order-4 flex w-full items-center gap-2 md:order-none md:ml-auto md:w-auto"
        >
          <label htmlFor="header-search" className="sr-only">
            Tìm kiếm công thức
          </label>
          <input
            id="header-search"
            type="search"
            name="q"
            placeholder="Tìm công thức..."
            className="input h-9 w-full py-1 md:w-52"
          />
          <button type="submit" className="btn btn-primary h-9 shrink-0 px-3 py-1 text-sm">
            Tìm
          </button>
        </form>

        <div className="ml-auto md:ml-0">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
