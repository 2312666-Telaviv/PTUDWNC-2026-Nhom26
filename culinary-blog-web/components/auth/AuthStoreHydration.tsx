'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

/**
 * Rehydrate auth-store ở phía client sau khi mount.
 * Store bật `skipHydration` nên phải gọi thủ công để tránh hydration mismatch với SSR.
 *
 * TODO: khi bộ component dùng chung / layout chung của nhóm sẵn sàng,
 * chuyển lời gọi này vào components/StoreHydration.tsx để rehydrate một lần cho toàn app.
 */
export function AuthStoreHydration() {
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
  }, []);

  return null;
}
