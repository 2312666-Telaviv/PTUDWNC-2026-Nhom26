export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-4 py-8">
      <div className="aspect-video rounded-2xl bg-gray-200" />
      <div className="mt-6 h-8 w-2/3 rounded bg-gray-200" />
      <div className="mt-3 h-4 w-1/2 rounded bg-gray-200" />
      <div className="mt-6 space-y-2">
        <div className="h-4 rounded bg-gray-200" />
        <div className="h-4 rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
      </div>
    </div>
  );
}