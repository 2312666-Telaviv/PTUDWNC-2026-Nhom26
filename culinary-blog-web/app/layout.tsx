<<<<<<< HEAD
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
=======
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QuerySessionProvider from "@/components/providers/QuerySessionProvider";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
>>>>>>> origin/2312665-KieuHaLinh

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
});

export const metadata: Metadata = {
<<<<<<< HEAD
  title: {
    default: 'Culinary Blog',
    template: '%s | Culinary Blog',
  },
  description: 'Blog chia sẻ công thức nấu ăn Việt Nam',
  openGraph: {
    locale: 'vi_VN',
    type: 'website',
  },
=======
  title: "Culinary Blog",
  description: "Khám phá công thức nấu ăn Việt Nam và thế giới",
>>>>>>> origin/2312665-KieuHaLinh
};

export default function RootLayout({
  children,
<<<<<<< HEAD
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.className} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
=======
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <QuerySessionProvider>
          {children}
          <Toaster />
        </QuerySessionProvider>
>>>>>>> origin/2312665-KieuHaLinh
      </body>
    </html>
  );
}
