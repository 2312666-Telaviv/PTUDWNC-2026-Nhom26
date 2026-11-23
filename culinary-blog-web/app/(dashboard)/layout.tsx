import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const roles = session?.user?.roles ?? [];
  const isAdmin = session?.user?.role === 'Admin' || roles.includes('Admin');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
          <nav aria-label="Dashboard menu" className="flex flex-wrap gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-700"
            >
              Tổng quan
            </Link>
            {isAdmin && (
              <Link
                href="/dashboard/users"
                className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-orange-700"
              >
                Quản lý người dùng
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
