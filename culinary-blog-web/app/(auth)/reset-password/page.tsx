'use client';

import { Suspense } from 'react';
import ResetPasswordClient from './_client';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center">Đang tải...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
