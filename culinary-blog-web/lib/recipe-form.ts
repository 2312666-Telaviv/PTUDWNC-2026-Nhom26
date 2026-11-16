import type { CategoryDto } from '@/types/category';
import type { RecipeDto } from '@/types/api';
import type { RecipeFormData } from '@/types/recipe';

export function recipeToFormValues(
  recipe: RecipeDto,
  categories: CategoryDto[]
): RecipeFormData {
  const category = categories.find((item) => item.name === recipe.categoryName);

  return {
    title: recipe.title,
    description: recipe.description,
    categoryId: category?.id ?? '',
    prepTimeMinutes: recipe.preparationTime ?? 0,
    cookTimeMinutes: recipe.cookingTime ?? 0,
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
