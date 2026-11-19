'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/lib/stores/authStore';
import { LogOut, User, Mail, Lock } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tránh flash content khi chưa load xong store từ localStorage
  if (!mounted) {
    return null;
  }

  const handleLogout = async () => {
    logout();
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">Culinary Blog</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Navigation links (always visible) */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link href="/recipes" className="text-muted-foreground hover:text-primary transition-colors">
              Công thức
            </Link>
          </div>

          {/* Auth links */}
          {!isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Đăng ký</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user?.email || 'Tài khoản'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/profile">
                <Button size="sm">Hồ sơ</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
