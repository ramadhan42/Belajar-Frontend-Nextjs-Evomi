/* =========================================================================
 * IMPORT DEPENDENCIES
 * - ScrollProgressBar : komponen progress bar scroll global (aktif di semua halaman)
 * - Geist, Geist_Mono : font Google untuk fallback (tidak digunakan di className saat ini)
 * - ToastProvider     : context provider untuk sistem notifikasi toast global
 * - globals.css       : stylesheet global aplikasi
 * - localFont         : utilitas Next.js untuk mendaftarkan font lokal
 * - Metadata          : tipe TypeScript untuk metadata halaman
 * - defaultMetadata   : konfigurasi metadata default (title, description, OG, dll)
 * - ThemeProvider     : provider next-themes untuk dark/light mode
 * ========================================================================= */
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
// import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import localFont from "next/font/local";
import type { Metadata } from "next";
import { defaultMetadata } from "./metadata";

/* =========================================================================
 * METADATA HALAMAN
 * Menggunakan konfigurasi defaultMetadata dari file metadata.ts.
 * Mencakup title, description, Open Graph, Twitter Card, dan lainnya.
 * ========================================================================= */
export const metadata: Metadata = defaultMetadata;

/* =========================================================================
 * KONFIGURASI FONT LOKAL
 * - brandFont : font berat untuk heading dan judul (8 Heavy.ttf)
 *               Di-inject sebagai CSS variable --font-brand
 * - bodyFont  : font reguler untuk teks paragraf (Nohemi-Regular.otf)
 *               Di-inject sebagai CSS variable --font-body
 * ========================================================================= */
const brandFont = localFont({
  src: "./fonts/8 Heavy.ttf",
  variable: "--font-brand",
});

const bodyFont = localFont({
  src: "./fonts/Nohemi-Regular.otf",
  variable: "--font-body",
});

/* =========================================================================
 * KONFIGURASI FONT GOOGLE (Fallback / Reserved)
 * - geistSans : font sans-serif modern dari Vercel (CSS variable --font-geist-sans)
 * - geistMono : font monospace dari Vercel (CSS variable --font-geist-mono)
 * Keduanya didaftarkan sebagai fallback dan dapat diaktifkan di className body
 * jika diperlukan di masa mendatang.
 * ========================================================================= */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* =========================================================================
 * KOMPONEN: RootLayout
 * Layout root yang membungkus seluruh aplikasi Next.js.
 * Bertanggung jawab atas:
 * - Injeksi CSS variable font ke elemen <body>
 * - ThemeProvider: mengelola dark/light mode via kelas pada <html>
 * - ToastProvider: menyediakan sistem notifikasi toast di semua halaman
 * - ScrollProgressBar: progress bar scroll yang aktif di semua halaman
 * - suppressHydrationWarning: mencegah warning hydration dari next-themes
 *   yang memodifikasi atribut class pada <html> di sisi client
 * ========================================================================= */
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
        {/* ThemeProvider: attribute="class" menulis kelas "dark" ke <html> */}
        {/* <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}> */}
        <ToastProvider>
          {/* ScrollProgressBar aktif di semua halaman */}
          <ScrollProgressBar />
          {children}
        </ToastProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
