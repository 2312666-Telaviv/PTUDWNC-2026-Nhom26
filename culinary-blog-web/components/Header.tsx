import Link from 'next/link';
import { UserMenu } from '@/components/UserMenu';

export function Header() {
  return (
    <header className="border-b border-orange-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-orange-600">
            Culinary Blog
          </Link>
          <Link href="/recipes" className="text-gray-700 transition hover:text-orange-600">
            Công thức
          </Link>
        </nav>
        <UserMenu />
      </div>
    </header>
  );
}
