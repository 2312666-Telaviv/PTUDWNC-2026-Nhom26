import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">
        Xin chào, {session.user.name}!
      </h1>
      <p className="text-gray-600">Dashboard (sẽ hoàn thiện ở Bài 3)</p>
    </div>
  );
}
