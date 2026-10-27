/**
 * Toaster component để hiển thị các toast notification.
 * Đặt trong RootLayout hoặc components layout cao nhất.
 */
import * as React from 'react';
import { ToastProvider, ToastViewport } from '@/components/ui/use-toast';

export function Toaster() {
  return (
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  );
}
