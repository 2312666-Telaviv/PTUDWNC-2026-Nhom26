'use client';

import { useUIStore, RecipesViewMode } from '@/store/useUIStore';

const options: { value: RecipesViewMode; label: string; short: string }[] = [
  { value: 'grid', label: 'Lưới', short: '▦' },
  { value: 'list', label: 'Danh sách', short: '☰' },
];

export function ViewModeToggle() {
  // Dùng selector cho từng giá trị (đúng hướng dẫn Zustand)
  const viewMode = useUIStore((state) => state.recipesViewMode);
  const setRecipesViewMode = useUIStore((state) => state.setRecipesViewMode);

  return (
    <div className="inline-flex items-center overflow-hidden rounded-md border border-orange-200">
      {options.map((option) => {
        const isActive = viewMode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setRecipesViewMode(option.value)}
            aria-pressed={isActive}
            className={`px-3 py-1.5 text-sm font-medium transition ${
              isActive
                ? 'bg-orange-600 text-white'
                : 'bg-white text-orange-700 hover:bg-orange-50'
            }`}
          >
            {option.short} {option.label}
          </button>
        );
      })}
    </div>
  );
}
