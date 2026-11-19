'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { recipeService } from '@/lib/api/services';
import { useAuthStore } from '@/lib/stores/authStore';
import type { RecipeDto, RecipeStatus } from '@/types/api';

const statusMeta: Record<RecipeStatus, { label: string; className: string }> = {
  Draft: { label: 'Bản nháp', className: 'bg-amber-100 text-amber-800' },
  Published: { label: 'Đã đăng', className: 'bg-green-100 text-green-800' },
  Archived: { label: 'Lưu trữ', className: 'bg-slate-200 text-slate-700' },
  Deleted: { label: 'Đã xóa', className: 'bg-red-100 text-red-800' },
};

// Luồng trạng thái hợp lệ (phải khớp với RecipesController.StatusTransitions)
const transitions: Record<RecipeStatus, { status: RecipeStatus; label: string; variant?: 'outline' | 'destructive' }[]> = {
  Draft: [
    { status: 'Published', label: 'Đăng công thức' },
    { status: 'Deleted', label: 'Xóa', variant: 'destructive' },
  ],
  Published: [
    { status: 'Archived', label: 'Lưu trữ', variant: 'outline' },
    { status: 'Deleted', label: 'Xóa', variant: 'destructive' },
  ],
  Archived: [
    { status: 'Published', label: 'Đăng lại' },
    { status: 'Deleted', label: 'Xóa', variant: 'destructive' },
  ],
  Deleted: [
    { status: 'Draft', label: 'Khôi phục' },
  ],
};

function StatusBadge({ status }: { status: RecipeStatus }) {
  const meta = statusMeta[status] ?? statusMeta.Draft;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.className}`}>
      {meta.label}
    </span>
  );
}

export default function ManageRecipesPage() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [recipes, setRecipes] = useState<RecipeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    recipeService
      .getMyRecipes()
      .then(setRecipes)
      .catch(() => setRecipes([]))
      .finally(() => setIsLoading(false));
  }, [mounted, isAuthenticated]);

  async function handleStatus(id: number, status: RecipeStatus) {
    setBusyId(id);
    try {
      const result = await recipeService.changeStatus(id, status);
      setRecipes((prev) => prev.map((r) => (String(r.id) === String(id) ? { ...r, status: result.status } : r)));
      toast({ title: 'Thành công', description: result.message });
    } catch (error: any) {
      toast({
        title: 'Không thể đổi trạng thái',
        description: error.message ?? 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setBusyId(null);
    }
  }

  if (!mounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-semibold">Vui lòng đăng nhập để quản lý công thức.</h1>
        <Button asChild className="mt-6"><Link href="/login">Đăng nhập</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quản lý công thức</h1>
          <p className="text-muted-foreground">
            Thêm mới, chỉnh sửa và chuyển trạng thái: Nháp → Đã đăng → Lưu trữ / Đã xóa
          </p>
        </div>
        <Button asChild><Link href="/recipes/create">+ Thêm công thức</Link></Button>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-12">Đang tải...</p>
      ) : recipes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Bạn chưa có công thức nào.</p>
            <Button asChild className="mt-4"><Link href="/recipes/create">Tạo công thức đầu tiên</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recipes.map((recipe) => {
            const status: RecipeStatus = recipe.status ?? 'Draft';
            const imageUrl = recipe.imageUrl ?? recipe.primaryImageUrl;
            return (
              <Card key={recipe.id}>
                <CardContent className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageUrl} alt={recipe.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate font-semibold">{recipe.title}</h2>
                        <StatusBadge status={status} />
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{recipe.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Cập nhật: {recipe.updatedAt ? new Date(recipe.updatedAt).toLocaleString('vi-VN') : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/recipes/${recipe.slug}/edit`}>Chỉnh sửa</Link>
                    </Button>
                    {transitions[status]?.map((action) => (
                      <Button
                        key={action.status}
                        size="sm"
                        variant={action.variant ?? 'default'}
                        disabled={busyId === Number(recipe.id)}
                        onClick={() => handleStatus(Number(recipe.id), action.status)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
