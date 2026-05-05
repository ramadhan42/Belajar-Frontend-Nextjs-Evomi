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

const fontCaption = localFont({
  src: "./../../fonts/Nohemi-Regular.otf",
  variable: "--font-body",
  display: "swap",
});

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [showModal, setShowModal] = useState(false);
  const [produk, setProduk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
    getDetail();
  }, [params]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0071bc] text-white text-[10px] uppercase tracking-widest">
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Loading Essence...
      </motion.span>
    </div>
  );

  if (error || !produk) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0071bc] px-4 text-center">
      <h2 className={`${fontJudul.className} text-6xl text-white/20 mb-4`}>404</h2>
      <p className="text-white/70 text-sm mb-8 font-light italic">Aroma tidak ditemukan.</p>
      <Link href="/produk" className="px-8 py-3 bg-white text-[#0071bc] text-[10px] uppercase tracking-widest font-bold hover:bg-blue-50 transition-all rounded-full">Kembali</Link>
    </div>
  );

  return (
    <div className={`${fontJudul.variable} ${fontCaption.variable} font-body min-h-screen bg-[#0071bc] text-white selection:bg-white/20 antialiased`}>

      {/* MODAL SUCCESS */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#002d4b]/60 backdrop-blur-sm" 
              onClick={() => setShowModal(false)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl"
            >
              <div className="text-center text-[#0071bc]">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="h-6 w-6 text-[#0071bc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className={`${fontJudul.className} text-xl uppercase tracking-widest mb-2`}>Added to Bag</h2>
                <p className="text-slate-400 text-xs mb-8 font-light">{produk.nama} telah tersimpan.</p>
                <div className="space-y-3">
                  <Link href="/profile" className="block w-full bg-[#0071bc] text-white py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#005a96] transition-colors text-center shadow-lg shadow-blue-100">Bag</Link>
                  <button onClick={() => setShowModal(false)} className="w-full text-slate-400 text-[10px] uppercase tracking-[0.2em] hover:text-[#0071bc] font-bold transition-colors">Continue</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#0071bc]/90 backdrop-blur-xl border-b border-white/10 px-6 py-6 flex items-center justify-between lg:px-16">
        <Link href="/produk" className="text-white/70 hover:text-white transition-all hover:-translate-x-1">
          <ArrowLeft size={20} />
        </Link>
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
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start"
        >

          {/* IMAGE SECTION */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0, transition: { duration: 1, ease: "easeOut" } }
            }}
            className="relative aspect-square w-full bg-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10"
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

          {/* CONTENT SECTION */}
          <div className="flex flex-col">
            <motion.div variants={fadeInUp} className="mb-10">
              <span className="text-[9px] uppercase tracking-[0.3em] text-white/60 font-bold mb-4 block">
                {produk.gender} • {produk.konsentrasi}
              </span>
              <h1 className={`${fontJudul.className} text-5xl lg:text-7xl uppercase leading-none mb-6 text-white`}>
                {produk.nama}
              </h1>
              <p className="text-2xl font-medium text-white/90">
                Rp {Number(produk.harga_retail).toLocaleString("id-ID")}
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-8 mb-12">
              <p className="text-white/80 text-sm leading-relaxed italic font-light border-l-2 border-white/20 pl-6">
                "{produk.deskripsi}"
              </p>
              <div className="flex flex-wrap gap-2">
                {produk.vibe?.split(',').map((v: string, index: number) => (
                  <motion.span 
                    key={v} 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (index * 0.1) }}
                    className="px-4 py-2 bg-white/10 text-white text-[9px] uppercase tracking-widest font-bold rounded-full border border-white/10"
                  >
                    {v.trim()}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* DETAILS GRID */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-8 py-8 border-y border-white/10 mb-10">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/50 mb-2">Volume</p>
                <p className="text-sm font-bold text-white">{produk.ukuran}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/50 mb-2">Longevity</p>
                <p className="text-sm font-bold text-white">{produk.ketahanan}</p>
              </div>
            </motion.div>

            {/* BUTTON SECTION */}
            <motion.div variants={fadeInUp}>
              {/* Anda mungkin perlu menyesuaikan style internal AddToCartButton agar sesuai dengan tema biru ini */}
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