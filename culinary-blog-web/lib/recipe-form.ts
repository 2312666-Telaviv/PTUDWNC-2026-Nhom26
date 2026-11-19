import { slugify } from '@/lib/utils/slugify';
import type { CategoryDto } from '@/types/category';
import type { RecipeDto } from '@/types/api';
import type { RecipeFormData } from '@/types/recipe';

export const RECIPE_UPDATE_SUCCESS_MESSAGE = 'Đã cập nhật công thức thành công!';

export function recipeToFormValues(
  recipe: RecipeDto,
  categories: CategoryDto[]
): RecipeFormData {
  const category = categories.find((item) => item.name === recipe.categoryName);

  return {
    title: recipe.title,
    description: recipe.description,
    slug: recipe.slug,
    instructions: recipe.instructions ?? '',
    categoryId: category?.id ?? slugify(recipe.categoryName),
    categoryName: recipe.categoryName,
    prepTimeMinutes: recipe.prepTimeMinutes ?? recipe.preparationTime ?? 1,
    cookTimeMinutes: recipe.cookTimeMinutes ?? recipe.cookingTime ?? 1,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    primaryImageUrl: recipe.primaryImageUrl ?? '',
    tags: recipe.tags?.join(', ') ?? '',
    steps: recipe.steps.map((step) => ({
      title: step.title ?? '',
      description: step.description,
      durationMinutes: undefined,
    })),
    ingredients: recipe.ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
    })),
  };
}
