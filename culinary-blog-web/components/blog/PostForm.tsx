'use client';

import { FormEvent, useState } from 'react';
import { CoverImage } from '@/components/blog/CoverImage';
import { slugify } from '@/lib/utils/slugify';
import { BlogPost } from '@/types/blog';

interface PostFormProps {
  mode: 'create' | 'edit';
  /** Dữ liệu bài viết khi sửa */
  initialPost?: BlogPost;
}

interface FormState {
  title: string;
  excerpt: string;
  tags: string;
  coverImageUrl: string;
  content: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  excerpt: '',
  tags: '',
  coverImageUrl: '',
  content: '',
};

/**
 * Form soạn thảo bài viết, dùng chung cho màn hình tạo mới (/blog/new)
 * và chỉnh sửa (/blog/[slug]/edit).
 * TODO: khi có API thật, nút Lưu sẽ gọi POST /api/v1/posts hoặc
 * PUT /api/v1/posts/{id} thay vì chỉ hiển thị thông báo thành công.
 */
export function PostForm({ mode, initialPost }: PostFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    initialPost
      ? {
          title: initialPost.title,
          excerpt: initialPost.excerpt,
          tags: initialPost.tags.join(', '),
          coverImageUrl: initialPost.coverImageUrl,
          content: initialPost.content.join('\n\n'),
        }
      : EMPTY_FORM
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError('Vui lòng nhập tiêu đề bài viết.');
      return;
    }

    if (!form.content.trim()) {
      setError('Vui lòng nhập nội dung bài viết.');
      return;
    }

    const slug = initialPost ? initialPost.slug : slugify(form.title);

    setError(null);
    setSuccess(
      mode === 'create'
        ? `Đã lưu bản nháp với đường dẫn /blog/${slug} (dữ liệu đang là bản nháp tĩnh, chưa gửi lên server).`
        : `Đã cập nhật bài viết /blog/${slug} (dữ liệu đang là bản nháp tĩnh, chưa gửi lên server).`
    );
  };

  const tagList = form.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <label htmlFor="post-title" className="form-label">
              Tiêu đề bài viết <span className="text-red-500">*</span>
            </label>
            <input
              id="post-title"
              type="text"
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Ví dụ: Cách nấu phở bò ngon nhất Hà Nội"
              className={error && !form.title.trim() ? 'input input-error' : 'input'}
            />

            <label htmlFor="post-excerpt" className="form-label mt-4">
              Mô tả ngắn
            </label>
            <textarea
              id="post-excerpt"
              value={form.excerpt}
              onChange={(event) => updateField('excerpt', event.target.value)}
              placeholder="Tóm tắt bài viết trong 1-2 câu, hiển thị trên thẻ bài viết"
              className="textarea"
              rows={2}
            />

            <label htmlFor="post-tags" className="form-label mt-4">
              Tag (cách nhau bằng dấu phẩy)
            </label>
            <input
              id="post-tags"
              type="text"
              value={form.tags}
              onChange={(event) => updateField('tags', event.target.value)}
              placeholder="phở, món chính, gia đình"
              className="input"
            />
            {tagList.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tagList.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <label htmlFor="post-content" className="form-label mt-4">
              Nội dung bài viết <span className="text-red-500">*</span>
            </label>
            <textarea
              id="post-content"
              value={form.content}
              onChange={(event) => updateField('content', event.target.value)}
              placeholder="Mỗi đoạn cách nhau bằng một dòng trống sẽ được tách thành đoạn riêng khi hiển thị"
              className="textarea"
              rows={12}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <label htmlFor="post-cover" className="form-label">
              Ảnh bìa (đường dẫn ảnh)
            </label>
            <input
              id="post-cover"
              type="text"
              value={form.coverImageUrl}
              onChange={(event) => updateField('coverImageUrl', event.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="input"
            />

            <div className="relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-md border border-orange-100 bg-orange-50">
              {form.coverImageUrl ? (
                <CoverImage src={form.coverImageUrl} alt={form.title || 'Ảnh bìa'} sizes="320px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-orange-400">
                  Chưa chọn ảnh bìa
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Thông tin bài viết</h2>
            <dl className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between gap-2">
                <dt>Đường dẫn</dt>
                <dd className="truncate font-medium text-gray-800">
                  /blog/{initialPost ? initialPost.slug : slugify(form.title) || '...'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Trạng thái</dt>
                <dd className="font-medium text-gray-800">
                  {mode === 'create' ? 'Bản nháp' : 'Chỉnh sửa'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-2">
            <button type="submit" className="btn btn-primary w-full">
              {mode === 'create' ? 'Lưu bài viết' : 'Lưu thay đổi'}
            </button>
            <button type="button" className="btn btn-outline w-full">
              Xem trước
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
