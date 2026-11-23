import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

// Đổi Google id_token lấy JWT của backend.
// Auth.js chỉ cung cấp profile từ Google; hệ thống mình cần JWT backend để gọi API,
// nên phải đổi id_token ở server (giữ bí mật client_id/secret và id_token).
async function exchangeGoogleToken(idToken: string): Promise<{
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  roles?: string[];
}> {
  const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      // Không làm sập đăng nhập: chỉ log và trả về rỗng để token thiếu accessToken
      console.error(`[auth] Đổi Google token thất bại với status ${response.status}`);
      return {};
    }

    const data = await response.json();
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      userId: data.userId || data.id,
      roles: Array.isArray(data.roles) ? data.roles : undefined,
    };
  } catch (error) {
    // Lỗi mạng/backend: vẫn cho đăng nhập, token sẽ không có accessToken backend
    console.error('[auth] Lỗi khi gọi API đổi Google token:', error);
    return {};
  }
}

const credentialsConfig = Credentials({
  id: 'credentials',
  name: 'Credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Mật khẩu', type: 'password' },
  },
  async authorize(credentials) {
    try {
      const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials?.email,
          password: credentials?.password,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        id: data.userId || data.id,
        email: data.email,
        name: data.name || data.userName,
        image: data.image,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        roles: Array.isArray(data.roles) ? data.roles : [],
        isDefaultPassword: data.isDefaultPassword === true,
      };
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      return null;
    }
  },
});

// Provider phụ: nhận JWT đã có được từ POST /api/v1/auth/login (axios ở client),
// kiểm tra token bằng GET /api/v1/auth/profile rồi tạo phiên NextAuth tương ứng.
// Giúp giữ nguyên các component dùng useSession()/auth() trong khi vẫn lưu token thật ở Zustand.
const backendTokenConfig = Credentials({
  id: 'backend-token',
  name: 'Backend JWT',
  credentials: {
    accessToken: { label: 'Access Token', type: 'text' },
    userId: { label: 'User Id', type: 'text' },
    email: { label: 'Email', type: 'email' },
    name: { label: 'Name', type: 'text' },
    fullName: { label: 'Full Name', type: 'text' },
    roles: { label: 'Roles', type: 'text' },
    isDefaultPassword: { label: 'Is Default Password', type: 'text' },
  },
  async authorize(credentials) {
    const token = credentials?.accessToken as string | undefined;
    if (!token) return null;

    try {
      const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/api/v1/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!response.ok) return null;

      const profile = await response.json() as {
        id?: string;
        email?: string;
        userName?: string;
        fullName?: string;
      };

      let roles: string[] = [];
      try {
        const parsed = JSON.parse((credentials?.roles as string) || '[]') as unknown;
        if (Array.isArray(parsed)) roles = parsed.filter((role): role is string => typeof role === 'string');
      } catch {
        roles = [];
      }

      return {
        id: profile.id || (credentials?.userId as string),
        email: profile.email || (credentials?.email as string),
        name: profile.fullName || (credentials?.name as string) || null,
        fullName: profile.fullName || undefined,
        image: null,
        accessToken: token,
        roles,
        isDefaultPassword: credentials?.isDefaultPassword === 'true',
      };
    } catch (error) {
      console.error('Lỗi xác thực token backend:', error);
      return null;
    }
  },
});

const providers: NextAuthConfig['providers'] = [credentialsConfig, backendTokenConfig];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

const authConfig: NextAuthConfig = {
  providers,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Lần đăng nhập đầu (Auth.js chỉ truyền account ở lần đăng nhập mới)
      if (user) {
        token.userId = user.id as string;
        token.accessToken = user.accessToken as string;
        token.refreshToken = user.refreshToken as string;
        token.roles = Array.isArray(user.roles) ? user.roles : [];
        token.fullName = typeof user.fullName === 'string' ? user.fullName : undefined;
        token.isDefaultPassword = user.isDefaultPassword === true;
      }

      if (trigger === 'update' && session && typeof session === 'object') {
        const updated = session as { fullName?: string; name?: string };
        if (typeof updated.fullName === 'string') {
          token.fullName = updated.fullName;
          token.name = updated.fullName;
        }
        if (typeof updated.name === 'string') {
          token.name = updated.name;
        }
      }

      // Google: đổi id_token lấy JWT backend rồi gắn accessToken/refreshToken của backend
      if (account?.provider === 'google' && account.id_token) {
        const backend = await exchangeGoogleToken(account.id_token);
        if (backend.accessToken) {
          token.accessToken = backend.accessToken;
        }
        if (backend.refreshToken) {
          token.refreshToken = backend.refreshToken;
        }
        if (backend.userId) {
          token.userId = backend.userId;
        }
        if (backend.roles) {
          token.roles = backend.roles;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.accessToken = token.accessToken as string;
        session.user.roles = Array.isArray(token.roles) ? token.roles : [];
        session.user.role = session.user.roles.includes('Admin') ? 'Admin' : session.user.roles[0] ?? 'User';
        session.user.fullName = typeof token.fullName === 'string' ? token.fullName : undefined;
        if (typeof token.fullName === 'string' && token.fullName.trim()) {
          session.user.name = token.fullName;
        }
        session.user.isDefaultPassword = token.isDefaultPassword === true;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
