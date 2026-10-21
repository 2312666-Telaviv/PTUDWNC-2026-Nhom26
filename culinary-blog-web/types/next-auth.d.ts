import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      accessToken?: string;
      roles?: string[];
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    roles?: string[];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
    roles?: string[];
  }
}
