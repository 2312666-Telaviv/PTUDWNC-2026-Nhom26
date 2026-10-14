import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-600">Không tìm thấy trang bạn cần.</p>
      <Link
        href="/recipes"
        className="rounded-lg bg-orange-600 px-5 py-2 text-white hover:bg-orange-700"
      >
        Xem công thức
      </Link>
    </main>
  );
}