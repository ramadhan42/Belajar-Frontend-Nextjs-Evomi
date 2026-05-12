"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { motion, Variants, AnimatePresence } from "framer-motion";

// String global url
import { BASE_URL, HARGA_EVOMI, HARGA_ONGKIR } from "@/src/config/strings";

import WavyNavbarGradient from "@/components/WavyNavbarGradient";

// --- Animasi Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
  }
};

// Stagger container untuk animasi anak-anaknya
const staggerContainer: Variants = {
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

// Font untuk deskripsi dan teks biasa
const fontCaption = localFont({
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

        {/* Bagian deskripsi yang sudah dimodifikasi */}
        <p className="text-[10px] text-stone-500 italic line-clamp-1 px-4">
          {parfum.deskripsi
            ? parfum.deskripsi
              .replace(/<[^>]*>?/gm, '')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
            : ''}
        </p>

        <p className="text-stone-700 font-medium text-[11px] md:text-sm tracking-wide pt-2">
          Rp {Number(parfum.harga_retail).toLocaleString("id-ID")}
        </p>
      </div>
    </motion.div>
  );
};

// Halaman utama untuk menampilkan produk
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 4; // Menampilkan 4 produk per halaman

  const [user, setUser] = useState<{
    id: any; email: string; name: string; username: string; image: string;
  } | null>(null);

  // 1. Inisialisasi: Load User Data & Mounted State
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user_data");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Gagal parse user data:", error);
      }
    }
  }, []);

  // 2. LOGIKA STATUS: Online / Offline
  useEffect(() => {
    if (!user) return;

    // Fungsi Set ONLINE (Menggunakan fetch biasa)
    const setOnlineStatus = async () => {
      try {
        const token = localStorage.getItem("access_token");
        await fetch(`${BASE_URL}/api/user/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ is_online: 1 })
        });
      } catch (err) {
        console.error("Gagal update status online:", err);
      }
    };

    setOnlineStatus();

    // Fungsi Set OFFLINE (Menggunakan Beacon API agar tetap terkirim saat browser tutup)
    const handleOfflineBeacon = () => {
      const url = `${BASE_URL}/api/user/status-beacon`;
      const data = JSON.stringify({
        user_id: user.id,
        is_online: 0
      });
      const blob = new Blob([data], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    };

    // Event listener untuk menutup tab/browser
    window.addEventListener('beforeunload', handleOfflineBeacon);

    return () => {
      // Jalankan offline beacon saat user pindah page (unmount)
      handleOfflineBeacon();
      window.removeEventListener('beforeunload', handleOfflineBeacon);
    };
  }, [user]);

  // 3. Fetch Produk Data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(BASE_URL + "/api/products", {
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


  // useEffect
  useEffect(() => {
    setMounted(true);
    const fetchProducts = async () => {
      try {
        const response = await fetch(BASE_URL + "/api/products", {
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

  // --- Logika Pagination ---
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Smooth scroll ke atas section produk
    const productSection = document.getElementById('collection-grid');
    if (productSection) {
      window.scrollTo({
        top: productSection.offsetTop - 150,
        behavior: 'smooth'
      });
    }
  };

  if (!mounted) return null;

  return (
    <div className={`${fontJudul.variable} ${fontCaption.variable} font-body min-h-screen bg-[#FBFBF9] text-stone-900 selection:bg-amber-200 selection:text-stone-900 antialiased`}>

      {/* NAVBAR */}
      <nav className="fixed w-full z-[100] bg-[#0071bc]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-300">

        {/* BARU: Memanggil Komponen Wavy Curve */}
        <WavyNavbarGradient />
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

      {/* PRODUCT GRID SECTION */}
      <section id="collection-grid" className="pb-32 px-4 md:px-8">
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
            <>
              <motion.div
                key={currentPage} // Menambahkan key agar animasi trigger ulang saat ganti halaman
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10 md:row-gap-16"
              >
                {currentProducts.map((parfum: any) => (
                  <ProductCard key={parfum.id} parfum={parfum} />
                ))}
              </motion.div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center mt-24 space-y-6">
                  <div className="h-[1px] w-24 bg-stone-200"></div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-3 text-stone-400 hover:text-stone-900 disabled:opacity-20 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          onClick={() => paginate(num)}
                          className={`w-10 h-10 rounded-full text-[10px] font-bold tracking-widest transition-all duration-300 ${currentPage === num
                            ? "bg-stone-900 text-white shadow-lg"
                            : "bg-transparent text-stone-400 hover:bg-stone-100 hover:text-stone-900"
                            }`}
                        >
                          {String(num).padStart(2, '0')}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-3 text-stone-400 hover:text-stone-900 disabled:opacity-20 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
              )}
            </>
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

        <div className="max-w-7xl mx-auto pt-8 border-t border-stone-100 text-[10px] text-stone-400 uppercase tracking-[0.2em] flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} EVOMI FRAGRANCE HOUSE.</p>
          <p>Handcrafted in Indonesia</p>
        </div>
      </motion.footer>
    </div>
  );
}