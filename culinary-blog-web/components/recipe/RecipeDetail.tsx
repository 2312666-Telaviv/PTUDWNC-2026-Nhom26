import Image from 'next/image';
import Link from 'next/link';
import { RecipeDto } from '@/types/api';
import { LikeButton } from '@/components/recipe/LikeButton';
import { formatDate } from '@/lib/utils/format';
import { slugify } from '@/lib/utils/slugify';

interface RecipeDetailProps {
  recipe: RecipeDto;
}

const difficultyLabels: Record<RecipeDto['difficulty'], string> = {
  Easy: 'Dễ',
  Medium: 'Trung bình',
  Hard: 'Khó',
};

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const blurDataUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"%3E%3Crect fill="%23fed7aa" width="100%" height="100%"/%3E%3C/svg%3E';
  const categorySlug = slugify(recipe.categoryName);

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link
          href="/recipes"
          className="inline-flex items-center gap-1 font-medium text-orange-600 transition hover:text-orange-700"
        >
          <span aria-hidden="true">←</span> Quay lại danh sách công thức
        </Link>
        <Link
          href={`/categories/${categorySlug}`}
          className="rounded-full bg-orange-50 px-3 py-1 font-medium text-orange-700 transition hover:bg-orange-100"
        >
          {recipe.categoryName}
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">{recipe.title}</h1>
        <p className="mb-4 text-lg text-gray-600">{recipe.description}</p>

        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
          <span>
            Tác giả: <span className="font-medium text-gray-700">{recipe.authorName}</span>
          </span>
          <span>
            Đăng ngày{' '}
            <time dateTime={recipe.createdAt} className="font-medium text-gray-700">
              {formatDate(recipe.createdAt)}
            </time>
          </span>
          <span>{recipe.viewCount} lượt xem</span>
        </div>

        <div className="mb-4">
          <LikeButton recipe={recipe} />
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span>Độ khó: {difficultyLabels[recipe.difficulty]}</span>
          <span>Chuẩn bị: {recipe.preparationTime} phút</span>
          <span>Nấu: {recipe.cookingTime} phút</span>
          <span>Tổng: {recipe.totalTime} phút</span>
          <span>Khẩu phần: {recipe.servings} người</span>
        </div>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-lg">
        <Image
          src={recipe.primaryImageUrl || '/images/recipe-placeholder.svg'}
          alt={recipe.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          placeholder="blur"
          blurDataURL={blurDataUrl}
          className="object-cover"
        />
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">Nguyên liệu</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient.id} className="flex items-center gap-2 rounded-md bg-orange-50 p-2">
              <span className="text-orange-700">•</span>
              <span className="text-gray-700">
                {ingredient.name}: {ingredient.quantity} {ingredient.unit}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">Các bước làm</h2>
        <ol className="space-y-4">
          {recipe.steps.map((step) => (
            <li key={step.id} className="rounded-lg border border-orange-100 p-4">
              <div className="mb-2 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-sm font-semibold text-white">
                  {step.stepNumber}
                </span>
                <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
              </div>
              <p className="ml-11 text-gray-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 pt-6">
        <Link href="/" className="text-sm font-medium text-orange-600 transition hover:text-orange-700">
          ← Về trang chủ
        </Link>
        <Link
          href={`/categories/${categorySlug}`}
          className="btn btn-outline text-sm"
        >
          Xem thêm món {recipe.categoryName}
        </Link>
      </footer>
    </article>
  );
}
