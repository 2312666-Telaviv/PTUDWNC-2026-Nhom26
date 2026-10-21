import { NextResponse } from 'next/server';
import { mockApi } from '@/lib/api/mockClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const recipeId = parseInt(searchParams.get('recipeId') || '0', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const res = mockApi.getComments(recipeId, page, pageSize);
  return NextResponse.json({
    items: res.items,
    totalCount: res.totalCount,
    pageNumber: res.pageNumber,
    pageSize: res.pageSize,
    totalPages: res.totalPages,
    hasNextPage: page * pageSize < res.totalCount,
  });
}
