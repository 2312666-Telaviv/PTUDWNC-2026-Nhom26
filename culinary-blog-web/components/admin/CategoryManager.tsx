'use client';

import { useState } from 'react';
import { toSlug, uniqueSlug } from '@/lib/utils/slug';

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  recipeCount: number;
}

interface CategoryManagerProps {
  initialCategories: AdminCategory[];
}

function validateName(name: string): string | null {
  const value = name.trim();
  if (value.length < 2 || value.length > 50) {
    return 'Tên danh mục phải từ 2 đến 50 ký tự.';
  }
  if (/[<>]/.test(value)) {
    return 'Tên danh mục không được chứa mã HTML.';
  }
  return null;
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<AdminCategory[]>(initialCategories);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    const trimmed = name.trim();
    const duplicated = categories.some(
      (category) =>
        category.id !== editingId && category.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicated) {
      setError('Tên danh mục đã tồn tại.');
      return;
    }

    setError(null);

    if (editingId) {
      // Sửa: chỉ đổi tên và mô tả, giữ nguyên slug để không hỏng liên kết cũ.
      setCategories((current) =>
        current.map((category) =>
          category.id === editingId
            ? { ...category, name: trimmed, description: description.trim() }
            : category
        )
      );
      setMessage(`Đã cập nhật danh mục "${trimmed}".`);
    } else {
      const slug = uniqueSlug(
        toSlug(trimmed),
        categories.map((category) => category.slug)
      );
      setCategories((current) => [
        ...current,
        {
          id: `c-${Date.now()}`,
          name: trimmed,
          slug,
          description: description.trim(),
          recipeCount: 0,
        },
      ]);
      setMessage(`Đã tạo danh mục "${trimmed}".`);
    }

    resetForm();
  };

  const handleEdit = (category: AdminCategory) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description);
    setError(null);
    setMessage(null);
  };

  const handleDelete = (category: AdminCategory) => {
    setMessage(null);

    if (category.recipeCount > 0) {
      setError(`Danh mục còn chứa ${category.recipeCount} công thức, không thể xóa.`);
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      return;
    }

    setError(null);
    setCategories((current) => current.filter((item) => item.id !== category.id));
    if (editingId === category.id) {
      resetForm();
    }
    setMessage(`Đã xóa danh mục "${category.name}".`);
  };

  const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mb-6 rounded-lg border border-orange-100 bg-white p-4"
      >
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          {editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-gray-700">
            Tên danh mục
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-md border border-orange-200 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none"
            />
          </label>
          <label className="block text-sm text-gray-700">
            Mô tả (không bắt buộc)
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1 w-full rounded-md border border-orange-200 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none"
            />
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
          >
            {editingId ? 'Lưu thay đổi' : 'Thêm danh mục'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                resetForm();
                setError(null);
              }}
              className="rounded-md border border-orange-300 px-4 py-2 text-sm text-orange-700 transition hover:bg-orange-50"
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      {error && (
        <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-orange-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-orange-50 text-gray-700">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Tên</th>
              <th scope="col" className="px-4 py-3 font-semibold">Slug</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Công thức</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((category) => (
              <tr key={category.id} className="border-t border-orange-100">
                <td className="px-4 py-3 font-medium text-gray-900">{category.name}</td>
                <td className="px-4 py-3 text-gray-600">{category.slug}</td>
                <td className="px-4 py-3 text-right text-gray-700">{category.recipeCount}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleEdit(category)}
                    className="mr-3 text-orange-700 hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category)}
                    className="text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}