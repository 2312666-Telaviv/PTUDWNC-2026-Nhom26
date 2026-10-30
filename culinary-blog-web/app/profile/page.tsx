'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { User } from '@/types/user'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const accessToken = useAuthStore((state) => state.accessToken)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const USE_MOCK_API =
    process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.USE_MOCK_API === 'true'

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      router.replace('/login?callbackUrl=/profile')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    const source: User | null = user || null
    if (source) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(source.name || '')
      setPhone(source.phone || '')
      setBio(source.bio || '')
    } else if (session?.user) {
      setName(session.user.name || '')
      setPhone('')
      setBio('')
    }
  }, [user, session])

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

  const displayName = user?.name || session.user.name || session.user.email || ''
  const displayEmail = session.user.email || user?.email || ''
  const displayRoles: string[] = session.user.roles || user?.roles || []
  const roleBadges = displayRoles.length ? displayRoles : ['User']
  const avatarUrl = user?.avatarUrl || session.user.image
  const initial = (displayName || displayEmail || '?').trim().charAt(0).toUpperCase()

  const validate = (): boolean => {
    if (!name.trim()) { setError('Họ tên không được để trống'); return false }
    if (name.trim().length > 100) { setError('Họ tên không được vượt quá 100 ký tự'); return false }
    if (phone.trim()) {
      const phoneRegex = /^[0-9+\-\s()]{7,20}$/
      if (!phoneRegex.test(phone.trim())) { setError('Số điện thoại không hợp lệ'); return false }
    }
    if (bio.trim().length > 500) { setError('Giới thiệu ngắn không được vượt quá 500 ký tự'); return false }
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!validate()) return
    setIsSaving(true)
    try {
      const USE_MOCK_API =
        process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.USE_MOCK_API === 'true'
      if (USE_MOCK_API || !accessToken) {
        if (user) {
          setUser({ ...user, name: name.trim(), phone: phone.trim() || null, bio: bio.trim() || null })
        } else {
          setUser({
            id: session.user.id || '',
            email: displayEmail,
            name: name.trim(),
            avatarUrl: avatarUrl || null,
            roles: displayRoles,
            phone: phone.trim() || null,
            bio: bio.trim() || null,
          })
        }
        setSuccess('Cập nhật thông tin thành công')
        return
      }
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5041'
      const res = await fetch(API_URL + '/api/v1/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null, bio: bio.trim() || null }),
      })
      if (!res.ok) throw new Error('Cập nhật thất bại')
      const data = (await res.json()) as { name?: string; phone?: string | null; bio?: string | null; avatarUrl?: string | null }
      if (user) {
        setUser({
          ...user,
          name: data.name ?? user.name,
          phone: data.phone ?? user.phone,
          bio: data.bio ?? user.bio,
          avatarUrl: data.avatarUrl ?? user.avatarUrl,
        })
      } else {
        setUser({
          id: session.user.id || '',
          email: displayEmail,
          name: data.name || name.trim(),
          avatarUrl: data.avatarUrl ?? avatarUrl ?? null,
          roles: displayRoles,
          phone: data.phone ?? (phone.trim() || null),
          bio: data.bio ?? (bio.trim() || null),
        })
      }
      setSuccess('Cập nhật thông tin thành công')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật hồ sơ')
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
      if (!USE_MOCK_API && accessToken) {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5041'
        const res = await fetch(API_URL + '/api/v1/users/me/password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
          body: JSON.stringify({ currentPassword, newPassword }),
        })
        if (!res.ok) throw new Error('Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.')
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600))
      }
      setPasswordSuccess('Đổi mật khẩu thành công')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi đổi mật khẩu')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-orange-50/30">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý thông tin tài khoản và mật khẩu của bạn.
          </p>
        </div>

        {USE_MOCK_API && (
          <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
            <strong>Chế độ demo:</strong> Dữ liệu chỉ được lưu trong bộ nhớ tạm, chưa ghi vào database thật.
          </div>
        )}

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

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-start">
          <aside className="lg:col-span-2">
            <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Thông tin tài khoản</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-gray-500">Họ tên</dt>
                  <dd className="mt-1 font-medium text-gray-900">{displayName || 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="mt-1 break-all font-medium text-gray-900">{displayEmail || 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Số điện thoại</dt>
                  <dd className="mt-1 font-medium text-gray-900">{phone.trim() || 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Giới thiệu</dt>
                  <dd className="mt-1 whitespace-pre-line text-gray-900">
                    {bio.trim() || 'Chưa cập nhật'}
                  </dd>
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
                <h2 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h2>
                <p className="mt-1 text-sm text-gray-600">Cập nhật họ tên và thông tin liên hệ của bạn.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="profile-name" className="form-label">
                    Họ tên
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    maxLength={100}
                    onChange={(e) => setName(e.target.value)}
                    className="input w-full"
                    placeholder="Nhập họ tên"
                  />
                </div>

                <div>
                  <label htmlFor="profile-email" className="form-label">
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={displayEmail}
                    readOnly
                    className="input w-full cursor-not-allowed bg-gray-50 text-gray-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi.</p>
                </div>

                <div>
                  <label htmlFor="profile-phone" className="form-label">
                    Số điện thoại
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input w-full"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label htmlFor="profile-bio" className="form-label">
                    Giới thiệu bản thân
                  </label>
                  <textarea
                    id="profile-bio"
                    value={bio}
                    maxLength={500}
                    onChange={(e) => setBio(e.target.value)}
                    className="input w-full"
                    rows={4}
                    placeholder="Giới thiệu ngắn về bạn"
                  />
                  <p className="mt-1 text-right text-xs text-gray-500">{bio.length}/500</p>
                </div>
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
                <button type="submit" disabled={isSaving} className="btn btn-primary px-6">
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
          </div>
        </div>
      </div>
    </div>
  )
}
