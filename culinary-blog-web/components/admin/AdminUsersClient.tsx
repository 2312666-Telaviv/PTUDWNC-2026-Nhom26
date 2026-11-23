'use client';

import { useCallback, useEffect, useState } from 'react';
import { DeleteUserDialog } from '@/components/admin/DeleteUserDialog';
import { adminApi } from '@/lib/api/admin';
import { getApiErrorMessage } from '@/lib/api/errorMessage';
import type { AdminRole, AdminUserDto, PaginatedResult } from '@/types/api';

const PAGE_SIZE = 10;

interface AdminUsersClientProps {
  currentUserId: string;
  currentUserEmail: string;
}

function formatDate(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export default function AdminUsersClient({ currentUserId, currentUserEmail }: AdminUsersClientProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResult<AdminUserDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserDto | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.getUsers({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
      });
      setData(result);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không tải được danh sách người dùng.'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const runAction = useCallback(
    async (id: string, action: () => Promise<{ message: string }>) => {
      setBusyId(id);
      setError(null);
      setNotice(null);
      try {
        const result = await action();
        setNotice(result.message);
        await loadUsers();
      } catch (err) {
        setError(getApiErrorMessage(err, 'Thao tác thất bại. Vui lòng thử lại.'));
      } finally {
        setBusyId(null);
      }
    },
    [loadUsers]
  );

  const handleToggleLock = (user: AdminUserDto) => {
    const message = user.isLocked
      ? `Mở khóa tài khoản ${user.email}?`
      : `Khóa tài khoản ${user.email}?`;
    if (!window.confirm(message)) return;

    void runAction(user.id, () =>
      user.isLocked ? adminApi.unlockUser(user.id) : adminApi.lockUser(user.id)
    );
  };

  const handleRoleChange = (user: AdminUserDto) => {
    const nextRole: AdminRole = user.role === 'Admin' ? 'User' : 'Admin';
    if (!window.confirm(`Đổi quyền của ${user.email} từ ${user.role} sang ${nextRole}?`)) return;

    void runAction(user.id, () => adminApi.updateUserRole(user.id, nextRole));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    void runAction(target.id, () => adminApi.deleteUser(target.id));
  };

  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Admin</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">Quản lý người dùng</h1>
          <p className="mt-1 text-sm text-gray-600">
            {data ? `${data.totalCount} tài khoản` : 'Đang tải dữ liệu tài khoản...'}
          </p>
          <p className="mt-1 text-xs text-gray-500">Đang đăng nhập: {currentUserEmail}</p>
        </div>

        <div className="w-full sm:w-80">
          <label htmlFor="admin-user-search" className="sr-only">
            Tìm kiếm người dùng
          </label>
          <input
            id="admin-user-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo email hoặc tên..."
            className="h-11 w-full rounded-xl border border-orange-100 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {notice}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-orange-100 bg-white shadow-sm">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="bg-orange-50 text-gray-700">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Email</th>
              <th scope="col" className="px-4 py-3 font-semibold">Họ tên</th>
              <th scope="col" className="px-4 py-3 font-semibold">Vai trò</th>
              <th scope="col" className="px-4 py-3 font-semibold">Trạng thái</th>
              <th scope="col" className="px-4 py-3 font-semibold">Ngày tạo</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-60' : undefined}>
            {data?.items.map((user) => {
              const initial = (user.fullName || '?').trim().charAt(0).toUpperCase();
              const isBusy = busyId === user.id;
              const isCurrentUser = user.id === currentUserId;

              return (
                <tr key={user.id} className="border-t border-orange-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                        {initial}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">{user.email}</p>
                        {user.isDefaultPassword && (
                          <p className="mt-0.5 text-xs font-medium text-red-600">Đang dùng mật khẩu mặc định</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="truncate font-medium text-gray-900">
                      {user.fullName || 'Chưa cập nhật'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.role === 'Admin'
                          ? 'bg-orange-600 text-white'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.isLocked
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {user.isLocked ? 'Bị khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={isBusy || isCurrentUser}
                        title={isCurrentUser ? 'Không thể khóa chính bạn' : undefined}
                        onClick={() => handleToggleLock(user)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          user.isLocked
                            ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                            : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {user.isLocked ? 'Mở khóa' : 'Khóa'}
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleRoleChange(user)}
                        className="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-50 disabled:opacity-50"
                      >
                        Đổi role
                      </button>
                      <button
                        type="button"
                        disabled={isBusy || isCurrentUser}
                        title={isCurrentUser ? 'Không thể xóa chính bạn' : undefined}
                        onClick={() => setDeleteTarget(user)}
                        className="rounded-lg border border-red-200 bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Trang {totalPages === 0 ? 0 : page} / {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trước
          </button>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Tiếp
          </button>
        </div>
      </div>

      <DeleteUserDialog
        user={deleteTarget}
        loading={busyId === deleteTarget?.id}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
