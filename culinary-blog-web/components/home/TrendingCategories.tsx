import Image from 'next/image';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { categoryApi } from '@/lib/api/server';
import type { CategoryDto } from '@/types/category';

interface TrendingCategoriesProps {
  selectedSlug?: string | null;
}

const unsplash = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80`;

const categoryImages: Record<string, string> = {
  'mon-chinh': unsplash('photo-1476224203421-9ac39bcb3327'),
  'mon-khai-vi': unsplash('photo-1559847844-5315695dadae'),
  'mon-canh-sup': unsplash('photo-1603105037880-880cd4edfb0d'),
  'mon-xao-kho': unsplash('photo-1598103442097-8b74394b95c6'),
  'mon-an-vat': unsplash('photo-1599490659213-e2b9527bd087'),
  'mon-chay': unsplash('photo-1546069901-ba9599a7e63c'),
  'trang-mieng-banh': unsplash('photo-1578985545062-69928b1d9587'),
  'do-uong': unsplash('photo-1495474472287-4d71bcdd2085'),
};

const categoryImagesByName: Record<string, string> = {
  'Món chính': categoryImages['mon-chinh'],
  'Món khai vị': categoryImages['mon-khai-vi'],
  'Món canh / Súp': categoryImages['mon-canh-sup'],
  'Món xào / Kho': categoryImages['mon-xao-kho'],
  'Món ăn vặt': categoryImages['mon-an-vat'],
  'Món chay': categoryImages['mon-chay'],
  'Tráng miệng & Bánh': categoryImages['trang-mieng-banh'],
  'Đồ uống': categoryImages['do-uong'],
};

const defaultImage = unsplash('photo-1490645935967-10de6ba17061');

function getCategoryImage(category: CategoryDto): string {
  return categoryImages[category.slug] ?? categoryImagesByName[category.name] ?? defaultImage;
}

export async function TrendingCategories({ selectedSlug }: TrendingCategoriesProps) {
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
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {categories.map((category) => {
        const isSelected = selectedSlug === category.slug;

        return (
          <Link
            key={category.id}
            href={`/?category=${category.slug}`}
            className={`group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
              isSelected ? 'ring-2 ring-orange-600 ring-offset-2' : ''
            }`}
          >
            <Image
              src={getCategoryImage(category)}
              alt={category.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-base font-bold text-white drop-shadow-sm sm:text-lg">{category.name}</p>
              <p className="mt-1 text-xs font-medium text-white/80 transition group-hover:text-white">
                Xem món thịnh hành →
              </p>
            </div>
            {isSelected && (
              <span className="absolute right-3 top-3 rounded-full bg-orange-600 px-2.5 py-1 text-xs font-semibold text-white">
                Đang chọn
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
