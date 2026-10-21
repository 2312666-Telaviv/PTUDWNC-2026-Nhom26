'use client';

import Image from 'next/image';
import { useState } from 'react';

interface CoverImageProps {
  src: string;
  alt: string;
  /** Kích thước ảnh dùng cho thuộc tính sizes của next/image */
  sizes?: string;
  /** Ảnh hiển thị trước khi tải xong */
  priority?: boolean;
}

/**
 * Ảnh bìa bài viết, tự động thay bằng nền placeholder khi ảnh từ xa lỗi
 * (mất mạng, ảnh không tồn tại) để giao diện không bị vỡ.
 */
export function CoverImage({ src, alt, sizes, priority = false }: CoverImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-orange-50 text-sm font-medium text-orange-400">
        Culinary Blog
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
      onError={() => setHasError(true)}
    />
  );
}
