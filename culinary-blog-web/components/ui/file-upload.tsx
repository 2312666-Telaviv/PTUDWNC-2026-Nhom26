'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { useToast } from '@/components/ui/use-toast';

interface FileUploadProps {
  acceptedTypes?: string[];
  maxSizeMB?: number;
  onFileChange: (file: File | null) => void;
  currentFile?: File | null;
  existingImageUrl?: string | null;
  disabled?: boolean;
}

export function FileUpload({
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  maxSizeMB = 10,
  onFileChange,
  currentFile,
  existingImageUrl,
  disabled = false,
}: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (currentFile) {
      const url = URL.createObjectURL(currentFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [currentFile]);

  const displayedUrl = previewUrl ?? existingImageUrl ?? null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      onFileChange(null);
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: 'Loại file không hợp lệ',
        description: 'Chỉ chấp nhận các định dạng ảnh: jpg, png, webp, gif.',
        variant: 'destructive',
      });
      event.target.value = '';
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: 'File quá lớn',
        description: `Kích thước file không được vượt quá ${maxSizeMB}MB.`,
        variant: 'destructive',
      });
      event.target.value = '';
      return;
    }

    onFileChange(file);
  };

  const removeImage = () => {
    setPreviewUrl(null);
    onFileChange(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ảnh công thức</CardTitle>
        <CardDescription>
          Tải ảnh minh họa cho công thức nấu ăn (tối đa {maxSizeMB}MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
        {displayedUrl ? (
          <div className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayedUrl}
              alt="Preview ảnh công thức"
              className="w-48 h-48 object-cover rounded-xl border border-border"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              aria-label="Xóa ảnh"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl bg-muted/50 p-8 hover:bg-muted/10 transition-colors">
            <label
              className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors',
                'border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 cursor-pointer',
                disabled && 'opacity-50 pointer-events-none'
              )}
            >
              Chọn ảnh
              <Input
                type="file"
                accept={acceptedTypes.join(',')}
                className="sr-only"
                onChange={handleFileChange}
                disabled={disabled}
              />
            </label>
            <p className="text-xs text-muted-foreground">
              Nhấp để chọn file ảnh
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center gap-2">
        {currentFile ? (
          <span className="text-sm text-muted-foreground truncate">
            {currentFile.name} • {(currentFile.size / 1024 / 1024).toFixed(2)} MB
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            {existingImageUrl && !previewUrl ? 'Giữ lại ảnh hiện tại' : 'Chưa chọn ảnh'}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
