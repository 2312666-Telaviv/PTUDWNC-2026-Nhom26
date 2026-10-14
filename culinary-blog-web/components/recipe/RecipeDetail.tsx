import Image from 'next/image';
import type { RecipeDto } from '@/types/api';

const difficultyLabel = { Easy: 'Dễ', Medium: 'Trung bình', Hard: 'Khó' } as const;

export function RecipeDetail({ recipe }: { recipe: RecipeDto }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <div className="relative aspect-video overflow-hidden rounded-2xl">
        <Image
          src={recipe.primaryImageUrl ?? '/images/recipe-placeholder.jpg'}
          alt={`Ảnh công thức ${recipe.title}`}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority
        />
      </div>

      <h1 className="mt-6 text-3xl font-bold">{recipe.title}</h1>
      <p className="mt-2 text-gray-600">
        {recipe.categoryName} · Tác giả: {recipe.authorName} · ❤ {recipe.likeCount}
      </p>
      {recipe.description && <p className="mt-4">{recipe.description}</p>}

      <ul className="mt-6 flex flex-wrap gap-4 text-sm">
        <li className="rounded-full bg-gray-100 px-3 py-1">Chuẩn bị: {recipe.prepTimeMinutes} phút</li>
        <li className="rounded-full bg-gray-100 px-3 py-1">Nấu: {recipe.cookTimeMinutes} phút</li>
        <li className="rounded-full bg-gray-100 px-3 py-1">{recipe.servings} khẩu phần</li>
        <li className="rounded-full bg-gray-100 px-3 py-1">Độ khó: {difficultyLabel[recipe.difficulty]}</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Nguyên liệu</h2>
      <ul className="mt-3 list-disc space-y-1 pl-6">
        {recipe.ingredients.map((ing) => (
          <li key={ing.id}>
            {ing.quantity} {ing.unit} {ing.name}
            {ing.notes && <span className="text-gray-500"> ({ing.notes})</span>}
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Cách làm</h2>
      <ol className="mt-3 space-y-3">
        {recipe.steps
          .slice()
          .sort((a, b) => a.stepNumber - b.stepNumber)
          .map((step) => (
            <li key={step.id} className="flex gap-3">
              <span className="font-bold text-orange-600">{step.stepNumber}.</span>
              <span>{step.description}</span>
            </li>
          ))}
      </ol>
    </article>
  );
}