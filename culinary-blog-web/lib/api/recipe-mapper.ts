import { slugify } from '@/lib/utils/slugify';
import type {
  PaginatedResult,
  RecipeDto,
  RecipeFormValues,
  RecipeIngredientDto,
  RecipeListDto,
  RecipeStatus,
  RecipeStepDto,
} from '@/types/api';

type BackendRecord = Record<string, any>;

const recipeStatuses: RecipeStatus[] = ['Draft', 'Published', 'Archived', 'Deleted'];
const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5041').replace(/\/+$/, '');

export function normalizeImageUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const imageUrl = value.trim();
  if (!imageUrl) return undefined;
  if (/^(https?:)?\/\//i.test(imageUrl) || /^(data:|blob:)/i.test(imageUrl)) return imageUrl;
  return `${apiOrigin}/${imageUrl.replace(/^\/+/, '')}`;
}

function normalizeStatus(value: unknown): RecipeStatus {
  return recipeStatuses.includes(value as RecipeStatus) ? (value as RecipeStatus) : 'Draft';
}

function normalizeDifficulty(value: unknown): 'Easy' | 'Medium' | 'Hard' {
  return value === 'Medium' || value === 'Hard' ? value : 'Easy';
}

function normalizeIngredient(raw: BackendRecord, index: number): RecipeIngredientDto {
  const quantityText = String(raw?.quantity ?? '').trim();
  const parts = quantityText ? quantityText.split(/\s+/) : [];
  const quantity = parts.shift() ?? '';
  const inferredUnit = parts.join(' ');

  return {
    id: raw?.id ?? index + 1,
    name: String(raw?.name ?? ''),
    quantity,
    unit: typeof raw?.unit === 'string' && raw.unit ? raw.unit : inferredUnit,
  };
}

function normalizeStep(raw: BackendRecord, index: number): RecipeStepDto {
  return {
    id: raw?.id ?? index + 1,
    stepNumber: Number(raw?.stepNumber) || index + 1,
    title: String(raw?.title ?? ''),
    description: String(raw?.instruction ?? raw?.description ?? ''),
  };
}

export function normalizeRecipeList(raw: BackendRecord): RecipeListDto {
  const prepTimeMinutes = Number(raw?.prepTimeMinutes ?? raw?.preparationTime ?? 0) || 0;
  const cookTimeMinutes = Number(raw?.cookTimeMinutes ?? raw?.cookingTime ?? 0) || 0;
  const imageUrl = normalizeImageUrl(raw?.imageUrl);
  const primaryImageUrl = normalizeImageUrl(raw?.primaryImageUrl) ?? imageUrl;

  return {
    id: Number(raw?.id ?? 0),
    title: String(raw?.title ?? ''),
    slug: String(raw?.slug ?? ''),
    description: String(raw?.description ?? ''),
    imageUrl,
    primaryImageUrl,
    status: normalizeStatus(raw?.status),
    authorId: String(raw?.authorId ?? ''),
    authorName: String(raw?.authorName ?? ''),
    createdAt: String(raw?.createdAt ?? new Date().toISOString()),
    updatedAt: raw?.updatedAt ? String(raw.updatedAt) : undefined,
    publishedAt: raw?.publishedAt ? String(raw.publishedAt) : undefined,
    prepTimeMinutes,
    cookTimeMinutes,
    totalTime: Number(raw?.totalTime) || prepTimeMinutes + cookTimeMinutes,
    servings: Number(raw?.servings ?? 0) || 0,
    difficulty: normalizeDifficulty(raw?.difficulty),
    categoryName: String(raw?.categoryName ?? 'Khác'),
    viewCount: Number(raw?.viewCount ?? 0) || 0,
    likeCount: Number(raw?.likeCount ?? 0) || 0,
    commentCount: Number(raw?.commentCount ?? 0) || 0,
  };
}

export function normalizeRecipe(raw: BackendRecord): RecipeDto {
  const list = normalizeRecipeList(raw);
  const steps = Array.isArray(raw?.steps) ? raw.steps : [];
  const ingredients = Array.isArray(raw?.ingredients) ? raw.ingredients : [];

  return {
    ...list,
    preparationTime: list.prepTimeMinutes ?? 0,
    cookingTime: list.cookTimeMinutes ?? 0,
    likeCount: list.likeCount ?? 0,
    isLiked: Boolean(raw?.isLiked),
    instructions: raw?.instructions ? String(raw.instructions) : undefined,
    steps: steps.map(normalizeStep),
    ingredients: ingredients.map(normalizeIngredient),
    tags: Array.isArray(raw?.tags) ? raw.tags.map(String) : undefined,
  };
}

export function normalizePaginatedResult(raw: BackendRecord): PaginatedResult<RecipeListDto> {
  const rawItems = Array.isArray(raw?.items)
    ? raw.items
    : Array.isArray(raw?.data)
      ? raw.data
      : [];
  const page = Number(raw?.page ?? raw?.pageNumber ?? 1) || 1;
  const pageSize = Number(raw?.pageSize ?? 10) || 10;

  return {
    items: rawItems.map((item: BackendRecord) => normalizeRecipeList(item)),
    totalCount: Number(raw?.totalCount ?? raw?.totalRecipes ?? rawItems.length) || 0,
    page,
    pageNumber: page,
    pageSize,
    totalPages: Number(raw?.totalPages ?? 0) || 0,
    hasNextPage: Boolean(raw?.hasNextPage),
    hasPreviousPage: Boolean(raw?.hasPreviousPage),
  };
}

export function buildRecipeFormData(
  data: RecipeFormValues & { status?: RecipeStatus; imageFile?: File | null }
): FormData {
  const formData = new FormData();
  const slug = data.slug?.trim() || slugify(data.title) || `cong-thuc-${Date.now()}`;

  formData.append('Title', data.title);
  formData.append('Description', data.description);
  formData.append('Slug', slug);
  formData.append('PrepTimeMinutes', String(data.prepTimeMinutes || 1));
  formData.append('CookTimeMinutes', String(data.cookTimeMinutes || 1));
  formData.append('Servings', String(data.servings || 1));
  formData.append('Difficulty', data.difficulty);
  formData.append('CategoryName', data.categoryName);
  if (data.instructions) formData.append('Instructions', data.instructions);
  if (data.status) formData.append('Status', data.status);
  if (data.imageFile) formData.append('imageFile', data.imageFile);

  data.steps?.forEach((step, index) => {
    formData.append(`Steps[${index}].StepNumber`, String(step.stepNumber ?? index + 1));
    formData.append(`Steps[${index}].Instruction`, step.description ?? '');
  });

  data.ingredients?.forEach((ingredient, index) => {
    const quantity = String(ingredient.quantity ?? '').trim();
    const unit = String(ingredient.unit ?? '').trim();
    formData.append(`Ingredients[${index}].Name`, ingredient.name);
    formData.append(`Ingredients[${index}].Quantity`, [quantity, unit].filter(Boolean).join(' '));
  });

  return formData;
}
