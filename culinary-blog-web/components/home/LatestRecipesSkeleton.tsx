const items = Array.from({ length: 6 }, (_, index) => index);

export function LatestRecipesSkeleton() {
  return (
    <section aria-hidden="true">
      <div className="mb-5 animate-pulse">
        <div className="h-7 w-48 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-72 max-w-full rounded bg-gray-100" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item}
            className="animate-pulse overflow-hidden rounded-lg border border-orange-100 bg-white shadow-sm"
          >
            <div className="aspect-[16/9] w-full bg-gray-200" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-100" />
              <div className="h-4 w-2/3 rounded bg-gray-100" />
              <div className="flex justify-between pt-2">
                <div className="h-3 w-24 rounded bg-gray-100" />
                <div className="h-3 w-20 rounded bg-gray-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
