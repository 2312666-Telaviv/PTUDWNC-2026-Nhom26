const items = Array.from({ length: 4 }, (_, index) => index);

export function TrendingCategoriesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4" aria-hidden="true">
      {items.map((item) => (
        <div
          key={item}
          className="aspect-[4/3] animate-pulse rounded-2xl bg-orange-100/70 shadow-sm"
        />
      ))}
    </div>
  );
}
