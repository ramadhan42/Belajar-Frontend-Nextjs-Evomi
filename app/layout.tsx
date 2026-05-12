
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

// --------------------------------------------------
// konfigurasi local font pada next js, ask gemini ai
// --------------------------------------------------
import localFont from "next/font/local";

// ----------------------------------
// Konfigurasi Font Lokal, Brand Font
// ----------------------------------
const brandFont = localFont({
  src: "./fonts/8 Heavy.ttf", // Ganti dengan nama file kamu
  variable: "--font-brand",
});

// ----------------------------------
// Konfigurasi Font Lokal, Body Font
// ----------------------------------
const bodyFont = localFont({
  src: "./fonts/Nohemi-Regular.otf", // Ganti dengan nama file kamu
  variable: "--font-body",
});

// ----------------------------------
// Konfigurasi Font Google, Geist Sans & Mono
// ----------------------------------
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Jika kamu ingin menggunakan Geist Mono, kamu bisa mengaktifkan baris berikut
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata untuk SEO dan informasi dasar situs
export const metadata: Metadata = {
  title: "Evomi",
  description: "Deskripsi Evomi",
};

// TODO: Add discount logic here
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        suppressHydrationWarning
        className={`${brandFont.variable} ${bodyFont.variable} min-h-full flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
