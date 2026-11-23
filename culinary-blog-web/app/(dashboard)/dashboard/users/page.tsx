import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AdminUsersClient from '@/components/admin/AdminUsersClient';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Quản lý người dùng',
};

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/users');
  }

  const roles = session.user.roles ?? [];
  const isAdmin = session.user.role === 'Admin' || roles.includes('Admin');
  if (!isAdmin) {
    redirect('/');
  }

  return (
    <AdminUsersClient
      currentUserId={session.user.id ?? ''}
      currentUserEmail={session.user.email ?? ''}
    />
  );
}
