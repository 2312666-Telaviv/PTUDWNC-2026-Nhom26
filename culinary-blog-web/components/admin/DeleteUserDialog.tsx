'use client';

import { useEffect, useRef, useState } from 'react';
import type { AdminUserDto } from '@/types/api';

interface DeleteUserDialogProps {
  user: AdminUserDto | null;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteUserDialog({ user, loading, onConfirm, onClose }: DeleteUserDialogProps) {
  const [typedEmail, setTypedEmail] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTypedEmail('');
    if (user) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loading, onClose, user]);

  if (!user) {
    return null;
  }

  const canDelete = typedEmail === user.email;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => !loading && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-user-title"
        className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="delete-user-title" className="text-lg font-bold text-gray-900">
          Xóa tài khoản
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Bạn sắp xóa tài khoản <span className="font-semibold text-gray-900">{user.email}</span>.
          Hành động này không thể hoàn tác. Nếu tài khoản có công thức hoặc dữ liệu liên quan, hệ
          thống sẽ khóa tài khoản thay vì xóa cứng.
        </p>

        <label htmlFor="delete-user-email" className="mt-5 block text-sm font-medium text-gray-700">
          Gõ chính xác email để xác nhận
        </label>
        <input
          ref={inputRef}
          id="delete-user-email"
          type="text"
          value={typedEmail}
          onChange={(event) => setTypedEmail(event.target.value)}
          disabled={loading}
          autoComplete="off"
          placeholder={user.email}
          className="mt-2 h-11 w-full rounded-xl border border-orange-100 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
        />
        <p className="mt-1.5 text-xs text-gray-500">Email phải khớp hoàn toàn để mở nút Xóa.</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canDelete || loading}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}
