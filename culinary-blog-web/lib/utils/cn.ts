import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Gộp nhiều class TailwindCSS thành một chuỗi, xử lý đúng thứ tự ưu tiên
 * (giống hàm cn trong shadcn/ui).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
