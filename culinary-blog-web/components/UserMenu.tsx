'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { logoutFromBackend } from '@/lib/api/auth-flow';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/useUIStore';

export function UserMenu() {
  const { data: session, status } = useSession();
  const authUser = useAuthStore((state) => state.user);
  const activeModal = useUIStore((state) => state.activeModal);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);
  const [signingOut, setSigningOut] = useState(false);

  const isAuthenticated = status === 'authenticated' || (status !== 'loading' && !!authUser);

  const handleConfirmSignOut = async () => {
    setSigningOut(true);
    try {
      await logoutFromBackend({ redirectTo: '/' });
    } finally {
      setSigningOut(false);
    }
  };

  if (status === 'loading') {
    return <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-md border border-orange-300 bg-white px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-50"
        >
          Đăng nhập
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
        >
          Đăng ký
        </Link>
      </div>
    );
  }

  const displayName = session?.user?.name || authUser?.name || session?.user?.email || authUser?.email || '?';
  const avatarUrl = session?.user?.image || authUser?.avatarUrl || undefined;
  const canUseNextImage =
    typeof avatarUrl === 'string' && (avatarUrl.startsWith('/') || avatarUrl.startsWith('https://'));
  const initial = displayName.trim().charAt(0).toUpperCase();
  const roles = session?.user?.roles?.length ? session.user.roles : (authUser?.roles ?? []);

  return (
    <div className="flex items-center gap-3">
      {avatarUrl && canUseNextImage ? (
        <Image
          src={avatarUrl}
          alt={displayName}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-sm font-medium text-white">
          {initial}
        </div>
      )}
      <span className="text-sm text-gray-700">Xin chào, {displayName}</span>
      <Link
        href="/profile"
        className="rounded-md border border-orange-300 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-50"
      >
        Hồ sơ cá nhân
      </Link>
      {roles.includes('Admin') && (
        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
          Admin
        </span>
      )}
      <button
        onClick={() => openModal('confirmLogout')}
        className="rounded-md border border-orange-300 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-50"
      >
        Đăng xuất
      </button>

      <ConfirmModal
        open={activeModal === 'confirmLogout'}
        title="Xác nhận đăng xuất"
        description="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?"
        confirmLabel="Đăng xuất"
        loading={signingOut}
        onConfirm={handleConfirmSignOut}
        onClose={closeModal}
      />
    </div>
  );
}
