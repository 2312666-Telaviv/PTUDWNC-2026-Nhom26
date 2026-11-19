import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Hàm tạo đường dẫn cho từng trang, ví dụ: (page) => `/recipes/page/${page}` */
  getHref: (page: number) => string;
}

function getPageItems(current: number, total: number): Array<number | 'gap'> {
  const wanted = new Set<number>([1, total, current - 1, current, current + 1]);
  const pages = Array.from(wanted)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const items: Array<number | 'gap'> = [];
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) {
      items.push('gap');
    }
    items.push(page);
  });
  return items;
}

const baseClass = 'min-w-9 rounded-md border px-3 py-2 text-center text-sm transition';
const activeClass = 'border-orange-600 bg-orange-600 font-medium text-white';
const idleClass = 'border-orange-200 text-gray-700 hover:bg-orange-50';
const disabledClass = 'cursor-not-allowed border-gray-200 text-gray-400';

export function Pagination({ currentPage, totalPages, getHref }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const items = getPageItems(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label="Phân trang" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {hasPrev ? (
        <Link href={getHref(currentPage - 1)} className={`${baseClass} ${idleClass}`}>
          Trước
        </Link>
      ) : (
        <span aria-disabled="true" className={`${baseClass} ${disabledClass}`}>
          Trước
        </span>
      )}

      {items.map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className="px-1 text-gray-500">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={getHref(item)}
            aria-current={item === currentPage ? 'page' : undefined}
            className={`${baseClass} ${item === currentPage ? activeClass : idleClass}`}
          >
            {item}
          </Link>
        )
      )}

      {hasNext ? (
        <Link href={getHref(currentPage + 1)} className={`${baseClass} ${idleClass}`}>
          Sau
        </Link>
      ) : (
        <span aria-disabled="true" className={`${baseClass} ${disabledClass}`}>
          Sau
        </span>
      )}
    </nav>
  );
}