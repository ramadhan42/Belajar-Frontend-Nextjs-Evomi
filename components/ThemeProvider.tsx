"use client";

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - NextThemesProvider : provider dari library next-themes yang mengelola
 *                        state tema (dark/light) dan menyimpannya ke localStorage
 * - ThemeProviderProps : tipe props dari next-themes untuk type safety
 * ========================================================================= */
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

/* =========================================================================
 * KOMPONEN: ThemeProvider
 * Wrapper tipis di atas NextThemesProvider dari library next-themes.
 * Di-render di app/layout.tsx untuk membungkus seluruh aplikasi.
 *
 * Konfigurasi yang direkomendasikan di layout:
 * - attribute="class"     : menulis kelas "dark" ke elemen <html>
 * - defaultTheme="light"  : tema default saat pertama kali dibuka
 * - enableSystem={false}  : tidak mengikuti preferensi sistem OS
 *
 * Tema yang dipilih user disimpan otomatis di localStorage oleh next-themes.
 * ========================================================================= */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
