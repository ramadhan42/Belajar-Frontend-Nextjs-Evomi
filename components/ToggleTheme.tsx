"use client";

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - useTheme   : hook dari next-themes untuk membaca dan mengubah tema
 * - useEffect & useState : untuk menghindari hydration mismatch
 * - Sun & Moon : ikon toggle dari Lucide
 * - motion     : animasi rotasi ikon dari Framer Motion
 * ========================================================================= */
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

/* =========================================================================
 * KOMPONEN: ThemeToggle
 * Tombol toggle dark/light mode yang dipasang di navbar.
 * - Menampilkan ikon Sun saat mode light, Moon saat mode dark
 * - Animasi rotasi ikon saat berganti tema
 * - Render null saat belum mounted untuk menghindari hydration mismatch
 * ========================================================================= */
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    /* -----------------------------------------------------------------------
     * EFFECT: Hydration Guard
     * Menunggu komponen ter-mount di client sebelum merender ikon,
     * agar tidak terjadi mismatch antara server dan client render.
     * ----------------------------------------------------------------------- */
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full bg-white/10 dark:bg-stone-800 border border-white/20 hover:scale-110 transition-all"
            aria-label="Toggle dark mode"
        >
            <motion.div
                key={theme}
                initial={{ rotate: -30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                    <Moon className="w-4 h-4 text-stone-200" />
                )}
            </motion.div>
        </button>
    );
}
