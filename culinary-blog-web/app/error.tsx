'use client';

import { useEffect } from 'react';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorMessage onRetry={reset} />;
}