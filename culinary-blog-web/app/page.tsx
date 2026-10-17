import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-orange-50 px-4">
      <h1 className="mb-6 text-center text-4xl font-bold text-gray-900 sm:text-5xl">
        Culinary Blog
      </h1>
      <p className="mb-8 max-w-2xl text-center text-lg text-gray-600">
        Khám phá và chia sẻ những công thức nấu ăn truyền thống tuyệt vời của Việt Nam
      </p>
      <Link
        href="/recipes"
        className="rounded-md bg-orange-600 px-6 py-3 font-medium text-white transition hover:bg-orange-700"
      >
        Xem công thức
      </Link>
    </div>
  );
}
