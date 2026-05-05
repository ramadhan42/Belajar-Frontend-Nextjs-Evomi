"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import localFont from "next/font/local";
import AddToCartButton from "@/components/AddToCartButton";
import { motion, AnimatePresence, Variants } from "framer-motion";

// --- Animasi Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

// 
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

// --- Custom Fonts ---
const fontJudul = localFont({
  src: "./../../fonts/8 Heavy.ttf",
  variable: "--font-brand",
  display: "swap",
});

// --- Custom Fonts ---
const fontCaption = localFont({
  src: "./../../fonts/Nohemi-Regular.otf",
  variable: "--font-body",
  display: "swap",
});

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [showModal, setShowModal] = useState(false);  // State for modal
  const [produk, setProduk] = useState<any>(null);  // State for product data
  const [loading, setLoading] = useState(true);  // State for loading
  const [error, setError] = useState(false);  // State for error

  useEffect(() => {
    const getDetail = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`https://ramadhan.alwaysdata.net/api/products/${resolvedParams.id}`, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) { setError(true); return; }
        const result = await response.json();
        setProduk(result.data ? result.data : result);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    getDetail();  // Get detail product
  }, [params]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9] text-stone-400 text-[10px] uppercase tracking-widest">
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Loading Essence...
      </motion.span>
    </div>
  );

  if (error || !produk) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBFBF9] px-4 text-center">
      <h2 className={`${fontJudul.className} text-6xl text-stone-200 mb-4`}>404</h2>
      <p className="text-stone-500 text-sm mb-8 font-light italic">Aroma tidak ditemukan.</p>
      <Link href="/produk" className="px-8 py-3 bg-stone-900 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-stone-700 transition-all">Kembali</Link>
    </div>
  );

  return (
    <div className={`${fontJudul.variable} ${fontCaption.variable} font-body min-h-screen bg-[#FBFBF9] text-stone-900 selection:bg-amber-200`}>

      {/* MODAL SUCCESS - Dengan AnimatePresence */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-stone-100"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="h-6 w-6 text-stone-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className={`${fontJudul.className} text-xl uppercase tracking-widest mb-2`}>Added to Bag</h2>
                <p className="text-stone-500 text-xs mb-8 font-light">{produk.nama} telah tersimpan.</p>
                <div className="space-y-3">
                  <Link href="/profile" className="block w-full bg-stone-900 text-white py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-stone-800 transition-colors text-center">Bag</Link>
                  <button onClick={() => setShowModal(false)} className="w-full text-stone-400 text-[10px] uppercase tracking-[0.2em] hover:text-stone-900">Continue</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#0071bc] backdrop-blur-xl border-b border-white/10 px-6 py-6 flex items-center justify-between lg:px-16 shadow-lg">
        {/* Tombol kembali disesuaikan ke warna putih */}
        <Link href="/produk" className="text-white/70 hover:text-white transition-all hover:-translate-x-1">
          <ArrowLeft size={20} />
        </Link>

        {/* Judul Brand disesuaikan ke warna putih */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${fontJudul.className} text-lg tracking-[0.2em] uppercase text-white`}
        >
          Evomi
        </motion.div>

        <div className="w-5" />
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-16 py-12 lg:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
        >

          {/* IMAGE SECTION - Slide in from left */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0, transition: { duration: 1, ease: "easeOut" } }
            }}
            className="relative aspect-square w-full bg-stone-100 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
          >
            <Image
              src={produk.image_url || "/img/placeholder.jpg"}
              alt={produk.nama}
              fill
              priority
              unoptimized
              className="object-cover hover:scale-105 transition-transform duration-1000"
            />
          </motion.div>

          {/* CONTENT SECTION - Staggered fade in */}
          <div className="flex flex-col">
            <motion.div variants={fadeInUp} className="mb-10">
              <span className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-4 block">
                {produk.gender} • {produk.konsentrasi}
              </span>
              <h1 className={`${fontJudul.className} text-5xl lg:text-6xl uppercase leading-none mb-6 text-stone-900`}>
                {produk.nama}
              </h1>
              <p className="text-xl font-medium text-stone-800">
                Rp {Number(produk.harga_retail).toLocaleString("id-ID")}
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-8 mb-12">
              <p className="text-stone-600 text-sm leading-relaxed italic font-light border-l-2 border-stone-200 pl-6">
                "{produk.deskripsi}"
              </p>
              <div className="flex flex-wrap gap-2">
                {produk.vibe?.split(',').map((v: string, index: number) => (
                  <motion.span
                    key={v}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (index * 0.1) }}
                    className="px-4 py-2 bg-stone-100 text-stone-600 text-[9px] uppercase tracking-widest font-bold rounded-full"
                  >
                    {v.trim()}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* DETAILS GRID */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-8 py-8 border-y border-stone-100 mb-10">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-stone-400 mb-2">Volume</p>
                <p className="text-sm font-bold">{produk.ukuran}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-stone-400 mb-2">Longevity</p>
                <p className="text-sm font-bold">{produk.ketahanan}</p>
              </div>
            </motion.div>

            {/* BUTTON SECTION */}
            <motion.div variants={fadeInUp}>
              <AddToCartButton
                productId={produk.id}
                productName={produk.nama}
                price={produk.harga_retail}
                image={produk.image_url}
                stock={99}
                onSuccess={() => setShowModal(true)}
              />
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}