import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

const USE_MOCK_API = process.env.USE_MOCK_API === 'true';

// Đổi Google id_token lấy JWT của backend.
// Auth.js chỉ cung cấp profile từ Google; hệ thống mình cần JWT backend để gọi API,
// nên phải đổi id_token ở server (giữ bí mật client_id/secret và id_token).
async function exchangeGoogleToken(idToken: string): Promise<{
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
}> {
  // Chế độ mock: bỏ qua gọi backend, cấp token giả để luồng đăng nhập chạy được
  if (USE_MOCK_API) {
    return {
      accessToken: 'mock-access-token-google',
      refreshToken: 'mock-refresh-token-google',
    };
  }

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
    if (USE_MOCK_API) {
      const email = credentials?.email as string;
      const password = credentials?.password as string;
      if (email === 'demo@culinary.vn' && password === 'Demo@123') {
        return {
          id: 'mock-user-1',
          email: 'demo@culinary.vn',
          name: 'Demo User',
          image: null,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        };
      }
      return null;
    }

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
      };
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      return null;
    }
  },
});

const providers: NextAuthConfig['providers'] = [credentialsConfig];

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
    async jwt({ token, user, account }) {
      // Lần đăng nhập đầu (Auth.js chỉ truyền account ở lần đăng nhập mới)
      if (user) {
        token.userId = user.id as string;
        token.accessToken = user.accessToken as string;
        token.refreshToken = user.refreshToken as string;
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
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
