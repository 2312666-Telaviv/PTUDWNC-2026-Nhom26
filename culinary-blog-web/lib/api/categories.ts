import { categoryApi } from './server';

export async function getCategories() {
  return categoryApi.getList();
}
