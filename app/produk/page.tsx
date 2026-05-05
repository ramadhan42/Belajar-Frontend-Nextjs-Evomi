"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { motion, Variants } from "framer-motion";

// --- Animasi Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
  }
};

const staggerContainer: Variants = {  // Variants untuk stagger animation
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    }
  }
};

// --- Font Configuration ---
const fontJudul = localFont({
  src: "./../fonts/8 Heavy.ttf",
  variable: "--font-brand",
  display: "swap",
});

const fontCaption = localFont({ // Variants untuk font caption
  src: "./../fonts/Nohemi-Regular.otf",
  variable: "--font-body",
  display: "swap",
});

// Komponen Card dengan Motion
const ProductCard = ({ parfum }: { parfum: any }) => {
  return (
    <motion.div
      variants={fadeInUp}
      className="group flex flex-col h-full"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-50 mb-5 rounded-2xl border border-stone-100 shadow-sm group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500">
        <Image
          src={parfum.image_url || "/img/placeholder.jpg"}
          alt={parfum.nama}
          fill
          unoptimized
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />

        <div className="absolute top-4 left-4 z-20">
          <span className="bg-white/95 backdrop-blur-sm text-stone-900 text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 font-bold rounded-full shadow-sm">
            {parfum.ukuran || "50ML"}
          </span>
        </div>

        {/* Link to Product Detail */}
        <Link href={`/produk/${parfum.id}`} className="absolute inset-0 z-10 opacity-0 md:group-hover:opacity-100 bg-stone-900/10 backdrop-blur-[2px] transition-all duration-500 flex items-end p-4">
          <div className="w-full bg-white/95 backdrop-blur-md py-3.5 text-[10px] uppercase font-bold tracking-widest text-center text-stone-800 translate-y-4 group-hover:translate-y-0 transition-all duration-500 rounded-xl shadow-lg hover:bg-stone-900 hover:text-white">
            View Details
          </div>
        </Link>
      </div>

      <div className="text-center space-y-2 px-2 flex-grow flex flex-col justify-end">
        <span className="text-[8px] md:text-[10px] text-stone-400 uppercase tracking-[0.2em] font-medium">Unisex Collection</span>
        <h3 className={`${fontJudul.className} text-base md:text-xl text-stone-800 uppercase leading-snug line-clamp-1 group-hover:text-amber-800 transition-colors`}>
          {parfum.nama}
        </h3>
        <p className="text-[10px] text-stone-500 italic line-clamp-1 px-4">
          {parfum.deskripsi}
        </p>
        <p className="text-stone-700 font-medium text-[11px] md:text-sm tracking-wide pt-2">
          {/* TODO: Add discount logic here */}
          Rp {Number(parfum.harga_retail).toLocaleString("id-ID")}
        </p>
      </div>
    </motion.div>
  );
};

export default function ProductsPage() {  // TODO: Add discount logic here
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // TODO: Add discount logic here
  useEffect(() => {
    setMounted(true); // Prevent hydration mismatch
    const fetchProducts = async () => { // TODO: Add discount logic here
      try {
        const response = await fetch("https://ramadhan.alwaysdata.net/api/products", {
          headers: { Accept: "application/json" },
        });
        const result = await response.json();
        setProducts(result.data || result || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (!mounted) return null;

  return (
    <div className={`${fontJudul.variable} ${fontCaption.variable} font-body min-h-screen bg-[#FBFBF9] text-stone-900 selection:bg-amber-200 selection:text-stone-900 antialiased`}>

      {/* NAVBAR */}
      <nav className="fixed w-full z-[100] bg-[#0071bc]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <Image
              src="/img/Logo Evomi.png"
              alt="Evomi"
              width={90}
              height={36}
              className="brightness-0 invert drop-shadow-sm"
            />
          </Link>
          <div className={`hidden md:flex space-x-10 ${fontJudul.className} text-[13px] tracking-[0.2em] uppercase text-white/90`}>
            <Link href="/" className="hover:text-blue-200 transition-colors duration-300">Home</Link>
            <Link href="/produk" className="text-blue-200">Collections</Link>
            <Link href="#footer" className="hover:text-blue-200 transition-colors duration-300">Contact</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="absolute top-0 left-0 w-full h-96 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-[30rem] h-[30rem] bg-stone-200/50 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <section className="pt-40 pb-16 px-6 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={fadeInUp} className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-8 md:w-12 h-[1px] bg-stone-300"></div>
            <span className="inline-block text-[10px] uppercase tracking-[0.5em] text-stone-400 font-bold">
              The Art of Fragrance
            </span>
            <div className="w-8 md:w-12 h-[1px] bg-stone-300"></div>
          </motion.div>

          <motion.h1 variants={fadeInUp} className={`${fontJudul.className} text-5xl md:text-7xl text-stone-900 mb-6 leading-tight uppercase tracking-tight`}>
            Our Collections
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-stone-500 max-w-xl mx-auto leading-relaxed text-sm md:text-base font-light italic">
            Dikurasi dengan bahan-bahan organik terbaik untuk menciptakan jejak
            aroma yang tak terlupakan. Temukan identitas Anda melalui koleksi kami.
          </motion.p>
        </motion.div>
      </section>

      {/* PRODUCT GRID */}
      <section className="pb-32 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex flex-col space-y-4">
                  <div className="aspect-[4/5] bg-stone-200/50 animate-pulse rounded-2xl"></div>
                  <div className="h-4 bg-stone-200/50 animate-pulse rounded mx-4"></div>
                  <div className="h-3 bg-stone-200/50 animate-pulse rounded mx-8"></div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
              variants={staggerContainer}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10 md:row-gap-16"
            >
              {products.map((parfum: any) => (
                <ProductCard key={parfum.id} parfum={parfum} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <motion.footer
        id="footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="bg-white pt-20 pb-10 px-6 md:px-8 border-t border-stone-100"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          <div className="space-y-6">
            <Image src="/img/Logo Evomi.png" alt="Evomi" width={100} height={40} className="brightness-0" />
            <p className="max-w-sm text-stone-500 text-sm font-light leading-relaxed italic">
              "Redefining Presence through Scent." <br /> Identitas yang tidak terlihat namun paling berkesan.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-[11px] uppercase tracking-widest text-stone-800">Location</h4>
            <p className="text-stone-500 text-sm font-light leading-relaxed">Jakarta, Indonesia<br />Sudirman Central Business District</p>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-[11px] uppercase tracking-widest text-stone-800">Connect</h4>
            <div className="flex flex-col gap-3 text-sm font-light text-stone-500">
              <a href="#" className="hover:text-stone-900 transition-colors">Instagram</a>
              <a href="#" className="hover:text-stone-900 transition-colors">TikTok</a>
            </div>
          </div>
        </div>

        {/* TODO: Add discount logic here */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-stone-100 text-[10px] text-stone-400 uppercase tracking-[0.2em] flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} EVOMI FRAGRANCE HOUSE.</p>
          <p>Handcrafted in Indonesia</p>
        </div>
      </motion.footer>
    </div>
  );
}