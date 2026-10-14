  import Link from 'next/link';

  export default function HomePage() {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Culinary Blog</h1>
        <p className="text-gray-600 mb-8">Khám phá công thức nấu ăn Việt Nam và thế giới</p>
        <Link href="/recipes" className="px-6 py-3 bg-orange-500 text-white rounded-xl">
          Xem công thức
        </Link>
      </main>
    );
  }