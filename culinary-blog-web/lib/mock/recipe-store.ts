import { mockCategories } from '@/lib/mock/categories';
import { mockRecipes } from '@/lib/mock/recipes';
import { slugify } from '@/lib/utils/slugify';
import type {
  PaginatedResult,
  RecipeDto,
  RecipeListDto,
  RecipeRequest,
  RecipeStatus,
} from '@/types/api';

// Kho dữ liệu mock chạy phía server cho các API route /api/mock/recipes.
// Dùng globalThis để dữ liệu không bị reset mỗi lần Next.js hot-reload trong dev.
interface RecipeStoreState {
  recipes: RecipeDto[];
  nextRecipeId: number;
  nextIngredientId: number;
  nextStepId: number;
}

const globalStore = globalThis as typeof globalThis & {
  __culinaryRecipeStore?: RecipeStoreState;
};

function cloneRecipe(recipe: RecipeDto): RecipeDto {
  return {
    ...recipe,
    ingredients: recipe.ingredients.map((ingredient) => ({ ...ingredient })),
    steps: recipe.steps.map((step) => ({ ...step })),
    tags: recipe.tags ? [...recipe.tags] : undefined,
  };
}

function createInitialState(): RecipeStoreState {
  const recipes = mockRecipes.map(cloneRecipe);
  const maxRecipeId = recipes.reduce((max, recipe) => Math.max(max, recipe.id), 0);
  const maxIngredientId = recipes.reduce(
    (max, recipe) =>
      recipe.ingredients.reduce((innerMax, ingredient) => Math.max(innerMax, ingredient.id), max),
    0
  );
  const maxStepId = recipes.reduce(
    (max, recipe) => recipe.steps.reduce((innerMax, step) => Math.max(innerMax, step.id), max),
    0
  );

  return {
    recipes,
    nextRecipeId: maxRecipeId + 1,
    nextIngredientId: maxIngredientId + 1,
    nextStepId: maxStepId + 1,
  };
}

function getStore(): RecipeStoreState {
  if (!globalStore.__culinaryRecipeStore) {
    globalStore.__culinaryRecipeStore = createInitialState();
  }
  return globalStore.__culinaryRecipeStore;
}

function toListDto(recipe: RecipeDto): RecipeListDto {
  return {
    id: recipe.id,
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description,
    totalTime: recipe.totalTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    categoryName: recipe.categoryName,
    authorName: recipe.authorName,
    primaryImageUrl: recipe.primaryImageUrl,
    viewCount: recipe.viewCount,
    createdAt: recipe.createdAt,
  };
}

function uniqueSlug(title: string, currentId?: number): string {
  const state = getStore();
  const base = slugify(title) || `cong-thuc-${Date.now()}`;
  let candidate = base;
  let suffix = 2;

  while (
    state.recipes.some((recipe) => recipe.slug === candidate && recipe.id !== currentId)
  ) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function parseTags(tags?: string): string[] | undefined {
  if (!tags) {
    return undefined;
  }

  const parsed = tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : undefined;
}

function findCategory(categoryId: string) {
  return mockCategories.find((category) => category.id === categoryId);
}

export function listPublishedRecipes(options: { categoryId?: number | null } = {}): RecipeListDto[] {
  const { categoryId } = options;
  return getStore()
    .recipes.filter((recipe) => recipe.status === 'Published')
    .filter((recipe) => (categoryId ? recipe.categoryId === categoryId : true))
    .map(toListDto);
}

export function getPublishedRecipeBySlug(slug: string): RecipeDto | undefined {
  const recipe = getStore().recipes.find(
    (item) => item.slug === slug && item.status === 'Published'
  );
  return recipe ? cloneRecipe(recipe) : undefined;
}

export function getRecipeById(
  id: number,
  options: { includeUnpublished?: boolean } = {}
): RecipeDto | undefined {
  const recipe = getStore().recipes.find((item) => item.id === id);
  if (!recipe) {
    return undefined;
  }
  if (!options.includeUnpublished && recipe.status !== 'Published') {
    return undefined;
  }
  return cloneRecipe(recipe);
}

export function getRecipeBySlugForManagement(slug: string): RecipeDto | undefined {
  const recipe = getStore().recipes.find((item) => item.slug === slug);
  return recipe ? cloneRecipe(recipe) : undefined;
}

export function createMockRecipe(
  request: RecipeRequest,
  author: { id: string; name: string }
): RecipeDto {
  const state = getStore();
  const category = findCategory(request.categoryId);
  const now = new Date().toISOString();
  const recipeId = state.nextRecipeId;
  state.nextRecipeId += 1;

  const recipe: RecipeDto = {
    id: recipeId,
    title: request.title.trim(),
    slug: uniqueSlug(request.title),
    description: request.description.trim(),
    preparationTime: request.prepTimeMinutes,
    cookingTime: request.cookTimeMinutes,
    totalTime: request.prepTimeMinutes + request.cookTimeMinutes,
    servings: request.servings,
    difficulty: request.difficulty,
    categoryId: category ? mockCategories.indexOf(category) + 1 : 0,
    categoryName: category?.name ?? 'Khác',
    authorId: author.id,
    authorName: author.name,
    primaryImageUrl: request.primaryImageUrl?.trim() || '/images/recipe-placeholder.svg',
    status: request.status === 'Published' ? 'Published' : 'Draft',
    viewCount: 0,
    likeCount: 0,
    isLiked: false,
    createdAt: now,
    updatedAt: now,
    tags: parseTags(request.tags),
    ingredients: request.ingredients.map((ingredient) => {
      const ingredientId = state.nextIngredientId;
      state.nextIngredientId += 1;
      return {
        id: ingredientId,
        name: ingredient.name.trim(),
        quantity: ingredient.quantity.trim(),
        unit: ingredient.unit.trim(),
      };
    }),
    steps: request.steps.map((step, index) => {
      const stepId = state.nextStepId;
      state.nextStepId += 1;
      return {
        id: stepId,
        stepNumber: index + 1,
        title: step.title?.trim() || `Bước ${index + 1}`,
        description: step.description.trim(),
      };
    }),
  };

  // Đưa công thức mới lên đầu danh sách để dễ thấy sau khi tạo.
  state.recipes.unshift(recipe);
  return cloneRecipe(recipe);
}

export function updateMockRecipe(id: number, request: RecipeRequest): RecipeDto | undefined {
  const state = getStore();
  const index = state.recipes.findIndex((recipe) => recipe.id === id);
  if (index === -1) {
    return undefined;
  }

  const current = state.recipes[index];
  const category = findCategory(request.categoryId);
  const now = new Date().toISOString();

  const updated: RecipeDto = {
    ...current,
    // Giữ slug ổn định sau khi tạo để tránh hỏng link công khai.
    title: request.title.trim(),
    description: request.description.trim(),
    preparationTime: request.prepTimeMinutes,
    cookingTime: request.cookTimeMinutes,
    totalTime: request.prepTimeMinutes + request.cookTimeMinutes,
    servings: request.servings,
    difficulty: request.difficulty,
    categoryId: category ? mockCategories.indexOf(category) + 1 : current.categoryId,
    categoryName: category?.name ?? current.categoryName,
    primaryImageUrl: request.primaryImageUrl?.trim() || '/images/recipe-placeholder.svg',
    tags: parseTags(request.tags),
    updatedAt: now,
    ingredients: request.ingredients.map((ingredient) => {
      const ingredientId = state.nextIngredientId;
      state.nextIngredientId += 1;
      return {
        id: ingredientId,
        name: ingredient.name.trim(),
        quantity: ingredient.quantity.trim(),
        unit: ingredient.unit.trim(),
      };
    }),
    steps: request.steps.map((step, stepIndex) => {
      const stepId = state.nextStepId;
      state.nextStepId += 1;
      return {
        id: stepId,
        stepNumber: stepIndex + 1,
        title: step.title?.trim() || `Bước ${stepIndex + 1}`,
        description: step.description.trim(),
      };
    }),
  };

  state.recipes[index] = updated;
  return cloneRecipe(updated);
}

export function updateMockRecipeStatus(
  id: number,
  status: RecipeStatus
): RecipeDto | undefined {
  const state = getStore();
  const index = state.recipes.findIndex((recipe) => recipe.id === id);
  if (index === -1) {
    return undefined;
  }

  const updated: RecipeDto = {
    ...state.recipes[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  state.recipes[index] = updated;
  return cloneRecipe(updated);
}

export function paginateRecipeList(
  recipes: RecipeListDto[],
  page: number,
  pageSize: number
): PaginatedResult<RecipeListDto> {
  const totalCount = recipes.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (page - 1) * pageSize;

  return {
    items: recipes.slice(startIndex, startIndex + pageSize),
    totalCount,
    pageNumber: page,
    pageSize,
    totalPages,
  };
}

export function getMockCategoriesForRecipe() {
  return mockCategories;
}
