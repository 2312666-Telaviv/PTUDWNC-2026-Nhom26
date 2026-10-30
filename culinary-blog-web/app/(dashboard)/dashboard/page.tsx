import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getMockRecipes } from '@/lib/mock/recipes';
import {
  DashboardIcon,
  type DashboardIconName,
} from '@/components/dashboard/DashboardIcon';

const stats: Array<{
  label: string;
  value: string;
  icon: DashboardIconName;
}> = [
  { label: 'Công thức đã lưu', value: '12', icon: 'bookmark' },
  { label: 'Công thức yêu thích', value: '8', icon: 'heart' },
  { label: 'Bài viết đã đọc', value: '24', icon: 'book' },
  { label: 'Ngày tham gia', value: '2024', icon: 'calendar' },
];

const quickAccess: Array<{
  href: string;
  title: string;
  description: string;
  icon: DashboardIconName;
}> = [
  {
    href: '/recipes',
    title: 'Xem công thức',
    description: 'Khám phá kho công thức nấu ăn phong phú.',
    icon: 'recipe',
  },
  {
    href: '/categories',
    title: 'Danh mục món ăn',
    description: 'Duyệt công thức theo từng nhóm món.',
    icon: 'categories',
  },
  {
    href: '/profile',
    title: 'Hồ sơ cá nhân',
    description: 'Cập nhật thông tin và mật khẩu của bạn.',
    icon: 'user',
  },
  {
    href: '/blog',
    title: 'Blog ẩm thực',
    description: 'Đọc bài viết và chia sẻ cùng cộng đồng.',
    icon: 'blog',
  },
];

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const displayName = session.user.name || session.user.email || 'Người dùng';
  const displayEmail = session.user.email || '—';
  const displayRoles: string[] = session.user.roles || [];
  const roleBadges = displayRoles.length ? displayRoles : ['User'];
  const avatarUrl = session.user.image;
  const initial = (displayName || displayEmail || '?').trim().charAt(0).toUpperCase();

  const suggestedRecipes = [...getMockRecipes()]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-orange-50/30">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:py-10">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-500 to-orange-400 p-6 text-white shadow-lg shadow-orange-200/60 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-white/10" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-20 w-20 shrink-0 rounded-full border-4 border-white/60 object-cover shadow-md"
                />
              ) : (
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/60 bg-white text-3xl font-bold text-orange-600 shadow-md">
                  {initial}
                </span>
              )}

              <div className="min-w-0">
                <p className="text-sm font-medium text-orange-100">Bảng điều khiển của bạn</p>
                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                  Chào mừng trở lại, {displayName}!
                </h1>
                <p className="mt-2 max-w-xl text-sm text-orange-50">
                  Tiếp tục hành trình nấu ăn và khám phá những công thức mới mỗi ngày.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {roleBadges.map((role) => (
                    <span
                      key={role}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        role === 'Admin'
                          ? 'bg-white text-orange-600'
                          : 'bg-white/20 text-white ring-1 ring-white/40'
                      }`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50"
              >
                <DashboardIcon name="user" className="h-4 w-4" />
                Hồ sơ cá nhân
              </Link>
              <Link
                href="/recipes"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/60 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Khám phá công thức
                <DashboardIcon name="arrow-right" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section aria-label="Thống kê nhanh" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                  <DashboardIcon name={stat.icon} className="h-5 w-5" />
                </span>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Thông tin tài khoản</h2>
              <p className="mt-1 text-sm text-gray-600">Thông tin hiển thị trên hồ sơ của bạn.</p>
            </div>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-lg border border-orange-300 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-50"
            >
              <DashboardIcon name="edit" className="h-4 w-4" />
              Chỉnh sửa hồ sơ
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <DashboardIcon name="user" className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Họ tên</p>
                <p className="mt-0.5 truncate font-semibold text-gray-900">{displayName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <DashboardIcon name="mail" className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</p>
                <p className="mt-0.5 break-all font-semibold text-gray-900">{displayEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <DashboardIcon name="shield" className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Vai trò</p>
                <p className="mt-0.5 font-semibold text-gray-900">{roleBadges.join(', ')}</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Truy cập nhanh</h2>
            <p className="mt-1 text-sm text-gray-600">Đi thẳng tới các khu vực bạn thường dùng.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickAccess.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-orange-300 hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600 transition group-hover:bg-orange-100">
                  <DashboardIcon name={item.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-semibold text-gray-900 transition group-hover:text-orange-600">
                  {item.title}
                </h3>
                <p className="mt-1 line-clamp-1 text-sm text-gray-500">{item.description}</p>
                <DashboardIcon
                  name="arrow-right"
                  className="absolute right-5 top-5 h-4 w-4 text-orange-400 transition group-hover:translate-x-0.5 group-hover:text-orange-600"
                />
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <DashboardIcon name="sparkles" className="h-5 w-5 text-orange-500" />
                Công thức gợi ý cho bạn
              </h2>
              <p className="mt-1 text-sm text-gray-600">Một vài món ngon bạn có thể thử ngay hôm nay.</p>
            </div>
            <Link
              href="/recipes"
              className="text-sm font-medium text-orange-600 transition hover:text-orange-700"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggestedRecipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.slug}`}
                className="group overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-orange-50">
                  <Image
                    src={recipe.primaryImageUrl || '/images/recipe-placeholder.svg'}
                    alt={recipe.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-orange-600 px-2.5 py-1 text-xs font-semibold text-white">
                    {recipe.categoryName}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 transition group-hover:text-orange-600">
                    {recipe.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{recipe.totalTime} phút · {recipe.servings} người</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
