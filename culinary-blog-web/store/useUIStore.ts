import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RecipesViewMode = 'grid' | 'list';

// Các modal có thể mở trong ứng dụng
export type ActiveModal = 'confirmLogout' | null;

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  activeModal: ActiveModal;
  openModal: (modal: Exclude<ActiveModal, null>) => void;
  closeModal: () => void;

  recipesViewMode: RecipesViewMode;
  setRecipesViewMode: (mode: RecipesViewMode) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      activeModal: null,
      openModal: (modal) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: null }),

      recipesViewMode: 'grid',
      setRecipesViewMode: (mode) => set({ recipesViewMode: mode }),
    }),
    {
      name: 'culinary-blog-ui-v1',
      // Chỉ lưu recipesViewMode để tránh lệch dữ liệu UI giữa các tab
      partialize: (state) => ({ recipesViewMode: state.recipesViewMode }),
      // Bật skipHydration để tránh lỗi hydration mismatch với SSR.
      // Store sẽ được rehydrate thủ công trong useEffect (xem ViewModeToggle).
      skipHydration: true,
    }
  )
);
