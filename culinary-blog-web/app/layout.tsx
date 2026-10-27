import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QuerySessionProvider from "@/components/providers/QuerySessionProvider";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Culinary Blog",
  description: "Khám phá công thức nấu ăn Việt Nam và thế giới",
};

export default function RootLayout({
  children,
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
      </body>
    </html>
  );
}
