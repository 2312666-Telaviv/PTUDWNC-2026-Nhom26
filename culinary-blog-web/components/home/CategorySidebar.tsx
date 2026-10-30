import Link from 'next/link';
import { categoryApi } from '@/lib/api/server';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CategoryDto } from '@/types/category';

interface CategorySidebarProps {
  selectedSlug?: string | null;
}

export async function CategorySidebar({ selectedSlug }: CategorySidebarProps) {
  let categories: CategoryDto[];

  try {
    categories = await categoryApi.getList();
  } catch {
    return (
      <ErrorState
        title="Không tải được danh mục"
        description="Danh sách danh mục đang gặp sự cố. Vui lòng thử lại sau."
      />
    );
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        title="Chưa có danh mục"
        description="Các danh mục công thức sẽ xuất hiện tại đây."
      />
    );
  }

  return (
    <div className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Danh mục</h2>
      <ul className="space-y-1">
        {categories.map((category) => {
          const isSelected = selectedSlug === category.slug;
          return (
            <li key={category.id}>
              <Link
                href={`/?category=${category.slug}`}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                  isSelected
                    ? 'bg-orange-50 text-orange-700 font-medium'
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                <span>{category.name}</span>
                {isSelected && (
                  <span className="text-orange-600 font-bold">✓</span>
                )}
                {!isSelected && (
                  <span aria-hidden="true" className="text-orange-400 opacity-0 group-hover:opacity-100">
                    →
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        href="/recipes"
        className="mt-3 flex items-center justify-center rounded-md border-t border-orange-100 px-3 pt-3 text-sm font-medium text-orange-600 transition hover:text-orange-700"
      >
        Xem tất cả công thức
      </Link>
    </div>
  );
}
