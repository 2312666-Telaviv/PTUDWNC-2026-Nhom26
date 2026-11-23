import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      accessToken?: string;
      roles?: string[];
      role?: string;
      fullName?: string;
      isDefaultPassword?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    roles?: string[];
    fullName?: string;
    isDefaultPassword?: boolean;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
    roles?: string[];
    fullName?: string;
    isDefaultPassword?: boolean;
  }
}
