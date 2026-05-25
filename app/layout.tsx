
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";
import ScrollProgressBar from "@/components/ScrollProgressBar";

// --------------------------------------------------
// konfigurasi local font pada next js, ask gemini ai
// --------------------------------------------------
import localFont from "next/font/local";


import type { Metadata } from "next";
import { defaultMetadata } from "./metadata";

// Metadata
export const metadata: Metadata = defaultMetadata;

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

// TODO: Add discount logic here
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Struktur dasar HTML dengan kelas untuk font dan layout
    <html lang="en" className="scroll-smooth">
      <body
        suppressHydrationWarning
        className={`${brandFont.variable} ${bodyFont.variable} min-h-full flex flex-col`}
      > <ToastProvider>
        {/* Pasang komponen di sini agar aktif di semua halaman */}
        <ScrollProgressBar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}