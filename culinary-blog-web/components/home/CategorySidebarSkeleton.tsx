const items = Array.from({ length: 5 }, (_, index) => index);

export function CategorySidebarSkeleton() {
  return (
    <div
      className="animate-pulse rounded-xl border border-orange-100 bg-white p-4 shadow-sm"
      aria-hidden="true"
    >
      <div className="mb-4 h-6 w-28 rounded bg-gray-200" />
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="h-9 rounded-md bg-gray-100" />
        ))}
      </div>
      <div className="mt-5 h-4 w-36 rounded bg-gray-200" />
    </div>
  );
}
