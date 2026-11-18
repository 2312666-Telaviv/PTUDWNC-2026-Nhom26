import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { formatDate } from '@/lib/utils/format';
import { mockUsers, UserRole } from '@/lib/mock/users';

export const metadata: Metadata = {
  title: 'Danh sách người dùng',
};

interface UsersPageProps {
  searchParams: Promise<{ role?: string }>;
}

const roleLabels: Record<UserRole, string> = {
  Admin: 'Quản trị viên',
  Author: 'Tác giả',
};

const filters: Array<{ label: string; value?: UserRole }> = [
  { label: 'Tất cả' },
  { label: 'Quản trị viên', value: 'Admin' },
  { label: 'Tác giả', value: 'Author' },
];

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.roles?.includes('Admin')) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          Bạn không có quyền xem trang này. Chỉ Quản trị viên mới truy cập được.
        </div>
      </div>
    );
  }

  const { role } = await searchParams;
  const activeRole: UserRole | undefined = role === 'Admin' || role === 'Author' ? role : undefined;
  const users = activeRole ? mockUsers.filter((user) => user.role === activeRole) : mockUsers;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Danh sách người dùng</h1>
      <p className="mb-6 text-sm text-gray-600">{users.length} người dùng</p>

      <nav aria-label="Lọc theo vai trò" className="mb-4 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = filter.value === activeRole;
          return (
            <Link
              key={filter.label}
              href={filter.value ? `/dashboard/users?role=${filter.value}` : '/dashboard/users'}
              aria-current={isActive ? 'page' : undefined}
              className={`rounded-md border px-4 py-2 text-sm transition ${
                isActive
                  ? 'border-orange-600 bg-orange-600 font-medium text-white'
                  : 'border-orange-200 text-gray-700 hover:bg-orange-50'
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      <div className="overflow-x-auto rounded-lg border border-orange-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-orange-50 text-gray-700">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Họ tên</th>
              <th scope="col" className="px-4 py-3 font-semibold">Email</th>
              <th scope="col" className="px-4 py-3 font-semibold">Vai trò</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Công thức</th>
              <th scope="col" className="px-4 py-3 font-semibold">Ngày tham gia</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-orange-100">
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      user.role === 'Admin' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {roleLabels[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-700">{user.recipeCount}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}