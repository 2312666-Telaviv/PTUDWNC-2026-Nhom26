'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />;
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
      >
        Đăng nhập
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700">Xin chào, {session.user?.name}</span>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="rounded-md border border-orange-300 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-50"
      >
        Đăng xuất
      </button>
    </div>
  );
}
