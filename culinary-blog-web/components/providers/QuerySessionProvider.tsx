'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';

export default function QuerySessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Khởi tạo QueryClient với cấu hình mặc định (ví dụ: tắt tự động fetch lại khi bật lại tab trình duyệt)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // Dữ liệu cũ sau 5 phút
            refetchOnWindowFocus: false, // Không tự động gọi lại API khi chuyển tab
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}