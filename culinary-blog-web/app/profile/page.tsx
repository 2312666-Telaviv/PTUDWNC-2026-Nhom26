'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useAuthStore as useLegacyAuthStore } from '@/lib/stores/authStore'
import { authService, recipeService } from '@/lib/api/services'
import { logoutFromBackend } from '@/lib/api/auth-flow'
import { getApiErrorMessage } from '@/lib/api/errorMessage'
import { isApiError } from '@/lib/api/error'
import type { ProfileDto, RecipeDto } from '@/types/api'
import type { User } from '@/types/user'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const [profile, setProfile] = useState<ProfileDto | null>(null)
  const [myRecipes, setMyRecipes] = useState<RecipeDto[]>([])
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      router.replace('/login?callbackUrl=/profile')
    }
  }, [session, status, router])

  useEffect(() => {
    if (status !== 'authenticated') return

    let cancelled = false
    authService
      .getProfile()
      .then((data) => {
        if (cancelled) return
        setProfile(data)
        setEmail(data.email)
      })
      .catch((err) => {
        if (cancelled) return
        if (isApiError(err) && err.statusCode === 401) {
          void logoutFromBackend().then(() => router.replace('/login?callbackUrl=/profile'))
          return
        }
        setError(getApiErrorMessage(err, 'Không tải được thông tin hồ sơ từ API.'))
      })

    return () => {
      cancelled = true
    }
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return

    let cancelled = false
    recipeService
      .getMyRecipes()
      .then((recipes) => {
        if (!cancelled) setMyRecipes(recipes)
      })
      .catch(() => {
        if (!cancelled) setMyRecipes([])
      })

    return () => {
      cancelled = true
    }
  }, [status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-orange-50/30">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <div className="mb-6 space-y-2">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-72 max-w-full animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-40 animate-pulse rounded-2xl bg-white shadow-sm" />
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm lg:col-span-2" />
            <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm lg:col-span-3" />
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user) return null

  const displayName =
    profile?.userName || user?.name || session.user.name || profile?.email || session.user.email || ''
  const displayEmail = profile?.email || session.user.email || user?.email || ''
  const displayRoles: string[] = session.user.roles || user?.roles || []
  const roleBadges = displayRoles.length ? displayRoles : ['User']
  const avatarUrl = user?.avatarUrl || session.user.image
  const initial = (displayName || displayEmail || '?').trim().charAt(0).toUpperCase()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Email không hợp lệ')
      return
    }
    if (!profile) {
      setError('Thông tin hồ sơ chưa được tải xong. Vui lòng thử lại.')
      return
    }
    if (email.trim() === profile.email) {
      setSuccess('Email không có thay đổi.')
      return
    }

    setIsSaving(true)
    try {
      await authService.updateProfile({ email: email.trim() })
      const refreshed = await authService.getProfile()
      setProfile(refreshed)
      setEmail(refreshed.email)

      const updatedUser: User = {
        id: refreshed.id,
        email: refreshed.email,
        name: refreshed.userName || user?.name || refreshed.email,
        avatarUrl: user?.avatarUrl ?? null,
        roles: displayRoles,
      }
      setUser(updatedUser)
      useLegacyAuthStore.getState().setUser(
        {
          id: refreshed.id,
          email: refreshed.email,
          userName: updatedUser.name,
          name: updatedUser.name,
        },
        useAuthStore.getState().accessToken || ''
      )
      setSuccess('Cập nhật email thành công.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Cập nhật thất bại. Vui lòng thử lại.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (!currentPassword.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }
    if (newPassword === currentPassword) {
      setPasswordError('Mật khẩu mới phải khác mật khẩu hiện tại')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp')
      return
    }

    setIsChangingPassword(true)
    try {
      await authService.changePassword({
        email: displayEmail,
        currentPassword,
        newPassword,
      })
      setPasswordSuccess('Đổi mật khẩu thành công')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(getApiErrorMessage(err, 'Đổi mật khẩu thất bại. Vui lòng thử lại.'))
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleLogout = async () => {
    await logoutFromBackend()
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-orange-50/30">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="mt-1 text-sm text-gray-600">
            Thông tin tài khoản được lấy trực tiếp từ API backend.
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 sm:h-28" />
          <div className="flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:px-8">
            <div className="-mt-12 sm:-mt-14">
              {avatarUrl && (String(avatarUrl).startsWith('/') || String(avatarUrl).startsWith('http')) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={String(avatarUrl)}
                  alt={displayName}
                  className="h-24 w-24 rounded-full border-4 border-white bg-white object-cover shadow-md sm:h-28 sm:w-28"
                />
              ) : (
                <span className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-orange-600 text-3xl font-semibold text-white shadow-md sm:h-28 sm:w-28">
                  {initial}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 pb-1 sm:pb-2">
              <h2 className="truncate text-2xl font-bold text-gray-900">{displayName || 'Người dùng'}</h2>
              <p className="mt-1 break-all text-sm text-gray-600">{displayEmail}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {roleBadges.map((role) => (
                  <span
                    key={role}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      role === 'Admin'
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {role}
                  </span>
                ))}
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  Thành viên Culinary Blog
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Công thức của tôi</h2>
              <p className="mt-1 text-sm text-gray-600">
                Tổng {myRecipes.length} công thức do chính bạn tạo, không gồm dữ liệu mẫu cộng đồng.
              </p>
            </div>
            <Link
              href="/dashboard/recipes"
              className="text-sm font-semibold text-orange-600 transition hover:text-orange-700"
            >
              Quản lý công thức →
            </Link>
          </div>

          {myRecipes.length === 0 ? (
            <p className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-sm text-gray-600">
              Bạn chưa có công thức nào.{' '}
              <Link href="/recipes/create" className="font-semibold text-orange-700 underline">
                Đăng công thức đầu tiên
              </Link>
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {myRecipes.slice(0, 3).map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.slug}`}
                  className="rounded-xl border border-orange-100 p-4 transition hover:border-orange-300 hover:bg-orange-50/60"
                >
                  <p className="line-clamp-2 font-semibold text-gray-900">{recipe.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{recipe.categoryName}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-start">
          <aside className="lg:col-span-2">
            <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Thông tin tài khoản</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-gray-500">ID người dùng</dt>
                  <dd className="mt-1 break-all font-mono text-xs text-gray-900">
                    {profile?.id || session.user.id || 'Chưa cập nhật'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Tên đăng nhập</dt>
                  <dd className="mt-1 font-medium text-gray-900">{profile?.userName || displayName}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="mt-1 break-all font-medium text-gray-900">{displayEmail || 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Vai trò</dt>
                  <dd className="mt-1 font-medium text-gray-900">{roleBadges.join(', ')}</dd>
                </div>
              </dl>
            </div>
          </aside>

          <div className="space-y-6 lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Cập nhật email</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Backend hiện hỗ trợ cập nhật email qua PUT /api/v1/auth/profile.
                </p>
              </div>

              <div>
                <label htmlFor="profile-email" className="form-label">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full"
                  placeholder="Nhập email"
                />
              </div>

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700" role="status">
                  {success}
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button type="submit" disabled={isSaving || !profile} className="btn btn-primary px-6">
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>

            <form
              onSubmit={handlePasswordSubmit}
              className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Nên sử dụng mật khẩu mạnh và không dùng lại ở nơi khác.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="form-label">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input w-full"
                    placeholder="Nhập mật khẩu hiện tại"
                    autoComplete="current-password"
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="form-label">
                    Mật khẩu mới
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input w-full"
                    placeholder="Tối thiểu 6 ký tự"
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="form-label">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input w-full"
                    placeholder="Nhập lại mật khẩu mới"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700" role="status">
                  {passwordSuccess}
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button type="submit" disabled={isChangingPassword} className="btn btn-primary px-6">
                  {isChangingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                </button>
              </div>
            </form>

            <div className="flex justify-end">
              <button type="button" onClick={handleLogout} className="btn btn-outline px-6">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
