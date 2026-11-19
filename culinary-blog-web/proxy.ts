import { NextResponse } from 'next/server';
import type { NextAuthRequest } from 'next-auth';
import { auth } from '@/lib/auth';

// CÃ¡c Ä‘Æ°á»ng dáº«n yÃªu cáº§u Ä‘Äƒng nháº­p
const PROTECTED_PREFIXES = ['/dashboard', '/recipes/new', '/profile'];

// Regex cho cÃ¡c route chá»‰nh sá»­a cÃ´ng thá»©c: /recipes/[id]/edit
const EDIT_RECIPE_REGEX = /^\/recipes\/[^/]+\/edit(\/|$)/;

// CÃ¡c trang chá»‰ dÃ nh cho khÃ¡ch chÆ°a Ä‘Äƒng nháº­p
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

  // ChÆ°a Ä‘Äƒng nháº­p mÃ  vÃ o route báº£o vá»‡ -> chuyá»ƒn vá» /login kÃ¨m callbackUrl
  if (isProtectedPath(pathname) && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // ÄÃ£ Ä‘Äƒng nháº­p mÃ  vÃ o trang Ä‘Äƒng nháº­p/Ä‘Äƒng kÃ½ -> chuyá»ƒn vá» /dashboard
  if (isAuthOnlyPath(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Bá» qua cÃ¡c route API, file tÄ©nh cá»§a Next vÃ  áº£nh
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
