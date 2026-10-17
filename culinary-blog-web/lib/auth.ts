import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

const USE_MOCK_API = process.env.USE_MOCK_API === 'true';

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
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id as string;
        token.accessToken = user.accessToken as string;
        token.refreshToken = user.refreshToken as string;
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
