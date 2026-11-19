import { isAxiosError } from 'axios';

interface ApiErrorPayload {
  message?: string;
  title?: string;
  detail?: string;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Có lỗi xảy ra, vui lòng thử lại.'
): string {
  if (isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorPayload | undefined;
    return payload?.message || payload?.title || payload?.detail || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
