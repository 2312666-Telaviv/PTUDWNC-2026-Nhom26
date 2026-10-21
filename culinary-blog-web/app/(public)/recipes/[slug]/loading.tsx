export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 py-8">
      <div className="mb-4 h-10 w-3/4 rounded bg-gray-200" />
      <div className="mb-4 h-6 w-full rounded bg-gray-200" />
      <div className="mb-4 flex gap-4">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-4 w-24 rounded bg-gray-200" />
      </div>
      <div className="mb-8 aspect-[16/9] w-full rounded bg-gray-200" />
      <div className="mb-4 h-8 w-1/3 rounded bg-gray-200" />
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="h-10 rounded bg-gray-200" />
        <div className="h-10 rounded bg-gray-200" />
        <div className="h-10 rounded bg-gray-200" />
        <div className="h-10 rounded bg-gray-200" />
      </div>
      <div className="mb-4 mt-8 h-8 w-1/3 rounded bg-gray-200" />
      <div className="space-y-4">
        <div className="h-20 rounded bg-gray-200" />
        <div className="h-20 rounded bg-gray-200" />
        <div className="h-20 rounded bg-gray-200" />
      </div>
    </div>
  );
}
