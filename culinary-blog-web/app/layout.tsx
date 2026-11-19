import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Culinary Blog',
    template: '%s | Culinary Blog',
  },
  description: 'Blog chia sẻ công thức nấu ăn Việt Nam - khám phá công thức nấu ăn Việt Nam và thế giới',
  openGraph: {
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className={`${inter.className} flex min-h-full flex-col antialiased`}>
        <Providers>
          <Navbar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
