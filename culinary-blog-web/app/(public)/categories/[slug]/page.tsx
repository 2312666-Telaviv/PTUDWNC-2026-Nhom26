import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RecipeGrid } from '@/components/recipe/RecipeGrid';
import { getMockRecipes, mockRecipes } from '@/lib/mock/recipes';

export const revalidate = 3600;

// Cùng cách tạo slug với app/(public)/categories/page.tsx
function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function findCategoryName(slug: string): string | undefined {
  const target = decodeURIComponent(slug).normalize('NFC');
  return mockRecipes
    .map((recipe) => recipe.categoryName)
    .find((name) => toSlug(name).normalize('NFC') === target);
}

export async function generateStaticParams() {
  const allRecipes = getMockRecipes();
  const categories = Array.from(new Set(allRecipes.map((r) => r.categoryName)));
  return categories.map((c) => ({
    slug: toSlug(c),
  }));
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const name = findCategoryName(slug);
  return {
    title: name ? `Danh mục ${name}` : 'Danh mục công thức',
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categoryName = findCategoryName(slug);

  if (!categoryName) {
    notFound();
  }

  const recipes = mockRecipes.filter((recipe) => recipe.categoryName === categoryName);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Đường dẫn" className="mb-4 text-sm text-gray-600">
        <Link href="/categories" className="transition hover:text-orange-600">
          Tất cả danh mục
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{categoryName}</span>
      </nav>

      <h1 className="mb-1 text-3xl font-bold text-gray-900">{categoryName}</h1>
      <p className="mb-6 text-sm text-gray-600">{recipes.length} công thức</p>

      <RecipeGrid recipes={recipes} />
    </div>
  );
}