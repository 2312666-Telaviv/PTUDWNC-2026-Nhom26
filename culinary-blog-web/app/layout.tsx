import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/Header';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
});

export const metadata: Metadata = {
  title: {
    default: 'Culinary Blog',
    template: '%s | Culinary Blog',
  },
  description: 'Blog chia sẻ công thức nấu ăn Việt Nam',
  openGraph: {
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.className} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
