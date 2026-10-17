export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
