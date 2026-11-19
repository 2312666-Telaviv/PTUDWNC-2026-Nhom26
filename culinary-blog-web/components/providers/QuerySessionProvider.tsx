'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Provider dùng chung cho ứng dụng.
 * LƯU Ý: dự án dùng JWT + Zustand (authStore) để xác thực, KHÔNG dùng next-auth.
 * Không được bọc SessionProvider ở đây vì nó gọi /api/auth/session (không tồn tại)
 * → trả HTML 404 → Auth.js parse JSON lỗi → client crash, không navigate được.
 */
export default function QuerySessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
