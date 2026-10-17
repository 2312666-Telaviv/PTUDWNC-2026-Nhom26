'use client';

import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useUIStore } from '@/store/useUIStore';

export function UserMenu() {
  const { data: session, status } = useSession();
  // activeModal đến từ Zustand store (dùng chung toàn ứng dụng)
  const activeModal = useUIStore((state) => state.activeModal);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);
  const [signingOut, setSigningOut] = useState(false);

  const handleConfirmSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: '/' });
  };

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

  // Avatar: dùng next/image cho ảnh Google (lh3.googleusercontent.com đã whitelist),
  // các ảnh khác (kể cả local) vẫn hiển thị bình thường; không có ảnh thì hiện chữ cái đầu.
  const avatarUrl = session.user?.image;
  const canUseNextImage =
    typeof avatarUrl === 'string' && (avatarUrl.startsWith('/') || avatarUrl.startsWith('https://'));
  const initial = (session.user?.name || session.user?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {avatarUrl && canUseNextImage ? (
        <Image
          src={avatarUrl}
          alt={session.user?.name || 'Ảnh đại diện'}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-sm font-medium text-white">
          {initial}
        </div>
      )}
      <span className="text-sm text-gray-700">Xin chào, {session.user?.name}</span>
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
