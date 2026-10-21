'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';

// Rehydrate store một lần sau khi mount để tránh lỗi hydration mismatch với SSR.
// Vì store bật skipHydration nên phải gọi thủ công ở client.
export function StoreHydration() {
  useEffect(() => {
    void useUIStore.persist.rehydrate();
  }, []);

  return null;
}
