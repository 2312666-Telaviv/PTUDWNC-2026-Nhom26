'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { recipeService } from '@/lib/api/services';

interface DeleteRecipeButtonProps {
  recipeId: number;
  recipeTitle?: string;
  onDeleted?: (id: number) => void;
  redirectTo?: string;
}

export function DeleteRecipeButton({
  recipeId,
  recipeTitle,
  onDeleted,
  redirectTo,
}: DeleteRecipeButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await recipeService.deleteRecipe(recipeId);
      setOpen(false);
      toast({ title: 'Đã xóa công thức', description: result.message });
      onDeleted?.(recipeId);
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Không thể xóa công thức',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" type="button">
          Xóa công thức
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa công thức</DialogTitle>
          <DialogDescription>
            {recipeTitle
              ? `Bạn có chắc muốn xóa “${recipeTitle}” khỏi database? `
              : 'Bạn có chắc muốn xóa công thức này khỏi database? '}
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Hủy
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
