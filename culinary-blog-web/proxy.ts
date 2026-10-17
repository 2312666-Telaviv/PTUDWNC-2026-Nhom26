import { NextResponse } from 'next/server';
import type { NextAuthRequest } from 'next-auth';
import { auth } from '@/lib/auth';

// Các đường dẫn yêu cầu đăng nhập
const PROTECTED_PREFIXES = ['/dashboard', '/recipes/new'];

// Regex cho các route chỉnh sửa công thức: /recipes/[id]/edit
const EDIT_RECIPE_REGEX = /^\/recipes\/[^/]+\/edit(\/|$)/;

// Các trang chỉ dành cho khách chưa đăng nhập
const AUTH_ONLY_PATHS = ['/login', '/register'];

function isProtectedPath(pathname: string): boolean {
  if (PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }
  return EDIT_RECIPE_REGEX.test(pathname);
}

function isAuthOnlyPath(pathname: string): boolean {
  return AUTH_ONLY_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export const proxy = auth((req: NextAuthRequest) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // Chưa đăng nhập mà vào route bảo vệ -> chuyển về /login kèm callbackUrl
  if (isProtectedPath(pathname) && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Đã đăng nhập mà vào trang đăng nhập/đăng ký -> chuyển về /dashboard
  if (isAuthOnlyPath(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Bỏ qua các route API, file tĩnh của Next và ảnh
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
