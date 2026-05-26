"use client";

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - useState & useEffect  : manajemen state slide aktif dan auto-play timer
 * - motion & AnimatePresence : animasi transisi antar slide (Framer Motion)
 * - Image                 : komponen gambar optimasi dari Next.js
 * - Link                  : navigasi ke halaman produk
 * - BASE_URL              : konstanta URL API global untuk path gambar
 * ========================================================================= */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { BASE_URL } from "@/src/config/strings";

/* =========================================================================
 * DATA: posters
 * Array data statis untuk setiap slide carousel.
 * Setiap item berisi id, judul, subtitle, dan URL gambar produk dari storage.
 * ========================================================================= */
const posters = [
  {
    id: 1,
    title: "Purpose Prestige",
    subtitle: "Prestige, Elegant",
    image: BASE_URL + "/storage/new products/gemini - purpose prestige.png",
  },
  {
    id: 2,
    title: "Peaceful Calm",
    subtitle: "Calm, Peaceful",
    image: BASE_URL + "/storage/new products/gemini - peaceful calm.png",
  },
  {
    id: 3,
    title: "Sweet Shy",
    subtitle: "Shy, Sweet",
    image: BASE_URL + "/storage/new products/gemini - sweet shy.png",
  },
  {
    id: 4,
    title: "Rabel Brave",
    subtitle: "Be Brave, Be You",
    image: BASE_URL + "/storage/new products/gemini - rabel brave.png",
  },
];

/* =========================================================================
 * KOMPONEN UTAMA: ImageCarousel
 * Carousel gambar produk dengan fitur:
 * - Auto-play setiap 5 detik menggunakan setInterval
 * - Navigasi manual via tombol panah kiri/kanan (muncul saat hover)
 * - Navigasi via bullet dots di bagian bawah slide
 * - Animasi transisi fade + scale antar slide menggunakan Framer Motion
 * - Overlay teks dengan judul, subtitle, dan tombol CTA "Shop Collection"
 * ========================================================================= */
export default function ImageCarousel() {

  /* -----------------------------------------------------------------------
   * STATE
   * - currentIndex : indeks slide yang sedang aktif ditampilkan
   * ----------------------------------------------------------------------- */
  const [currentIndex, setCurrentIndex] = useState(0);

  /* -----------------------------------------------------------------------
   * FUNGSI: nextSlide
   * Berpindah ke slide berikutnya secara siklik (kembali ke 0 setelah akhir).
   * ----------------------------------------------------------------------- */
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % posters.length);
  };

  /* -----------------------------------------------------------------------
   * FUNGSI: prevSlide
   * Berpindah ke slide sebelumnya secara siklik (ke akhir jika di awal).
   * ----------------------------------------------------------------------- */
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + posters.length) % posters.length);
  };

  /* -----------------------------------------------------------------------
   * EFFECT: Auto-Play Timer
   * Memanggil nextSlide setiap 5000ms secara otomatis.
   * Timer dibersihkan saat komponen di-unmount untuk mencegah memory leak.
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    /* =========================================================================
     * WRAPPER KARTU ARTISAN
     * Background sangat gelap (#0a0a0a) dengan border tipis dan shadow hitam pekat
     * untuk memberikan kesan premium dan menyatu dengan gambar botol parfum.
     * ========================================================================= */
    <div className="bg-[#0a0a0a] border border-neutral-900 rounded-[2.5rem] p-4 md:p-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)]">

      {/* =====================================================================
       * CONTAINER CAROUSEL
       * Background hitam penuh agar gambar botol parfum menyatu dengan latar.
       * Kelas `group` digunakan untuk menampilkan tombol panah saat hover.
       * ===================================================================== */}
      <div className="relative w-full h-[310px] md:h-[580px] overflow-hidden rounded-[1.75rem] group bg-black border border-neutral-950">

        {/* -------------------------------------------------------------------
         * ANIMASI TRANSISI SLIDE
         * AnimatePresence mode="wait" memastikan slide lama selesai exit
         * sebelum slide baru mulai masuk.
         * Efek: fade + scale halus dengan durasi 0.8 detik.
         * ------------------------------------------------------------------- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative w-full h-full"
          >

            {/* ---------------------------------------------------------------
             * OVERLAY KONTEN TEKS
             * Gradient dari hitam solid ke transparan (kiri ke kanan)
             * agar teks judul dan subtitle tetap terbaca di atas gambar.
             * Setiap elemen teks memiliki animasi stagger masuk dari bawah.
             * --------------------------------------------------------------- */}
            <div className="absolute inset-0 z-10 flex flex-col justify-center px-10 md:px-16 bg-gradient-to-r from-black via-black/60 to-transparent text-white">

              {/* Subtitle — animasi delay 0.3s */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-bold mb-3 text-amber-500/90"
              >
                {posters[currentIndex].subtitle}
              </motion.p>

              {/* Judul produk — animasi delay 0.4s */}
              <motion.h3
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-4xl md:text-6xl font-serif uppercase tracking-tighter leading-none mb-6 drop-shadow-md text-white"
              >
                {posters[currentIndex].title}
              </motion.h3>

              {/* Tombol CTA "Shop Collection" — animasi delay 0.5s */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Link
                  href="/produk"
                  className="relative inline-flex items-center justify-center px-6 py-3 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_4px_14px_rgba(255,255,255,0.1)] overflow-hidden group/btn"
                >
                  {/* Efek progress bar oranye/amber dari kiri ke kanan saat hover */}
                  <span className="absolute left-0 top-0 w-0 h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500 ease-out group-hover/btn:w-full z-0"></span>
                  {/* Teks tombol — berubah warna menjadi putih saat hover */}
                  <span className="relative z-10 transition-colors duration-500 group-hover/btn:text-white drop-shadow-sm">
                    Shop Collection
                  </span>
                </Link>
              </motion.div>
            </div>

            {/* ---------------------------------------------------------------
             * GAMBAR PRODUK
             * Menggunakan Next.js Image dengan fill untuk memenuhi container.
             * object-cover di mobile, object-contain di desktop agar botol
             * parfum tidak terpotong di layar besar.
             * --------------------------------------------------------------- */}
            <Image
              src={posters[currentIndex].image}
              alt={posters[currentIndex].title}
              fill
              className="object-cover md:object-contain object-right"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* -------------------------------------------------------------------
         * NAVIGASI BULLET DOTS
         * Ditampilkan di bagian bawah kiri slide.
         * Bullet aktif berwarna putih, bullet tidak aktif berwarna gelap.
         * Klik bullet untuk langsung berpindah ke slide tertentu.
         * ------------------------------------------------------------------- */}
        <div className="absolute bottom-6 left-10 md:left-16 z-20 flex gap-2.5">
          {posters.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                idx === currentIndex ? "w-10 bg-white" : "w-10 bg-neutral-800"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* -------------------------------------------------------------------
         * TOMBOL PANAH KIRI (Previous)
         * Hanya muncul saat container di-hover (opacity-0 → group-hover:opacity-100).
         * Background gelap transparan dengan backdrop blur untuk estetika.
         * ------------------------------------------------------------------- */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-xl bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 text-white/50 hover:text-white hover:bg-black/40 border border-white/5"
        >
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* -------------------------------------------------------------------
         * TOMBOL PANAH KANAN (Next)
         * Hanya muncul saat container di-hover (opacity-0 → group-hover:opacity-100).
         * ------------------------------------------------------------------- */}
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-xl bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 text-white/50 hover:text-white hover:bg-black/40 border border-white/5"
        >
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

      </div>
    </div>
  );
}
