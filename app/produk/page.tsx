"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";
import { motion, Variants, AnimatePresence } from "framer-motion";

// String global url
import { BASE_URL } from "@/src/config/strings";

import WavyNavbarGradient from "@/components/WavyNavbarGradient";
import ChatModal from "@/components/ChatModal";
import QuizModal from "@/components/QuizModal";

// --- Animasi Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const mobileMenuVars: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.5,
      ease: [0.21, 0.47, 0.32, 0.98],
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const itemVars: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

// --- Font Configuration ---
const fontJudul = localFont({
  src: "./../fonts/8 Heavy.ttf",
  variable: "--font-brand",
  display: "swap",
});

const fontCaption = localFont({
  src: "./../fonts/Nohemi-Regular.otf",
  variable: "--font-body",
  display: "swap",
});

// Komponen Card
const ProductCard = ({ parfum }: { parfum: any }) => {
  return (
    <motion.div variants={fadeInUp} className="group flex flex-col h-full">
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

        <Link
          href={`/produk/${parfum.id}`}
          className="absolute inset-0 z-10 opacity-0 md:group-hover:opacity-100 bg-stone-900/10 backdrop-blur-[2px] transition-all duration-500 flex items-end p-4"
        >
          {/* Tombol Lihat Produk dengan animasi hover orange penuh */}
          <div className="w-full bg-white/95 backdrop-blur-md py-3.5 text-[10px] uppercase font-bold tracking-widest text-center text-stone-800 translate-y-4 group-hover:translate-y-0 transition-all duration-500 rounded-xl shadow-lg overflow-hidden relative z-0 group/btn">
            <div className="absolute inset-0 bg-amber-500 scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-500 origin-left -z-10" />
            <span className="relative z-10 transition-colors duration-300 group-hover/btn:text-stone-950">
              Lihat Produk
            </span>
          </div>
        </Link>
      </div>

      <div className="text-center space-y-2 px-2 flex-grow flex flex-col justify-end">
        <span className="text-[8px] md:text-[10px] text-stone-400 uppercase tracking-[0.2em] font-medium">
          Unisex Collection
        </span>
        <h3
          className={`${fontJudul.className} text-base md:text-xl text-stone-800 uppercase leading-snug line-clamp-1 group-hover:text-amber-800 transition-colors`}
        >
          {parfum.nama}
        </h3>
        <p className="text-[10px] text-stone-500 italic line-clamp-1 px-4">
          {parfum.deskripsi
            ? parfum.deskripsi
                .replace(/<[^>]*>?/gm, "")
                .replace(/&nbsp;/g, " ")
                .replace(/&amp;/g, "&")
            : ""}
        </p>
        <p className="text-stone-700 font-medium text-[11px] md:text-sm tracking-wide pt-2">
          Rp {Number(parfum.harga_retail).toLocaleString("id-ID")}
        </p>
      </div>
    </motion.div>
  );
};

// ============================================================
// Halaman Produk
// Menampilkan daftar produk, fitur navigasi, modal chat, dan
// interaksi pengguna seperti login, logout, serta pagination.
// ============================================================

// Halaman utama
export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // States untuk Navbar UI
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // States untuk Modals
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 4;

  const [user, setUser] = useState<{
    id: any;
    email: string;
    name: string;
    username: string;
    image: string;
  } | null>(null);

  // useeffect
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

  // useeffect 2
  useEffect(() => {
    if (!user) return;
    const setOnlineStatus = async () => {
      try {
        const token = localStorage.getItem("access_token");
        await fetch(`${BASE_URL}/api/user/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_online: 1 }),
        });
      } catch (err) {
        console.error("Gagal update status online:", err);
      }
    };
    setOnlineStatus();

    const handleOfflineBeacon = () => {
      const url = `${BASE_URL}/api/user/status-beacon`;
      const data = JSON.stringify({ user_id: user.id, is_online: 0 });
      const blob = new Blob([data], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    };

    window.addEventListener("beforeunload", handleOfflineBeacon);
    return () => {
      handleOfflineBeacon();
      window.removeEventListener("beforeunload", handleOfflineBeacon);
    };
  }, [user]);

  // useeffect 3
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

  // handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(BASE_URL + "/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      setUser(null);
      setIsMenuOpen(false);
      router.refresh();
    }
    setIsMobileMenuOpen(false);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );

  // total pages
  const totalPages = Math.ceil(products.length / productsPerPage);

  // paginate
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    const productSection = document.getElementById("collection-grid");
    if (productSection) {
      window.scrollTo({
        top: productSection.offsetTop - 150,
        behavior: "smooth",
      });
    }
  };

  // !mounted
  if (!mounted) return null;

  return (
    <div
      className={`${fontJudul.variable} ${fontCaption.variable} font-body min-h-screen bg-[#FBFBF9] text-stone-900 selection:bg-amber-200 selection:text-stone-900 antialiased`}
    >
      {/* MODALS */}
      <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* ========================================================================= */}
      {/* FLOATING CHAT BUTTON (PROGRESS ORANGE HOVER)                              */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8, type: "spring" }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[90]"
      >
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="relative flex items-center justify-center w-14 h-14 bg-stone-900 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 group/chatbtn z-0"
        >
          <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden -z-10">
            <div className="w-full h-full bg-amber-500 scale-x-0 group-hover/chatbtn:scale-x-100 transition-transform duration-500 origin-left" />
          </div>

          {!isChatOpen && (
            <span className="absolute inset-0 rounded-full bg-stone-500 opacity-20 animate-ping group-hover/chatbtn:animate-none -z-10"></span>
          )}

          <svg
            className="w-6 h-6 text-[#FBFBF9] relative z-10 transition-colors duration-300 group-hover/chatbtn:text-stone-950"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            ></path>
          </svg>

          <span className="absolute right-16 px-4 py-2.5 bg-white text-stone-800 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl opacity-0 pointer-events-none group-hover/chatbtn:opacity-100 transition-all duration-300 shadow-xl border border-stone-100 whitespace-nowrap translate-x-2 group-hover/chatbtn:translate-x-0 z-20">
            {isChatOpen ? "Close Chat" : "Chat Admin"}
          </span>
        </button>
      </motion.div>
      {/* ========================================================================= */}
      {/* NAVBAR: SAMA PERSIS DENGAN LANDING PAGE (PROGRESS ORANGE KIRI-KANAN)      */}
      {/* ========================================================================= */}
      <nav className="fixed w-full z-[100] bg-[#0071bc]/95 backdrop-blur-xl border-b border-white/10 shadow-lg transition-all duration-300">
        <WavyNavbarGradient />
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
          
          {/* 1. SEKTOR KIRI: LOGO EVOMI MASKING PROGRESS ORANGE */}
          <div className="flex-1 md:w-1/2 flex justify-start">
            <Link
              href="/"
              className="relative group/logo block overflow-hidden"
            >
              <Image
                src="/img/Logo Evomi.png"
                alt="Evomi Logo"
                width={90}
                height={36}
                className="brightness-0 invert drop-shadow-sm group-hover/logo:opacity-0 transition-opacity duration-300 block"
              />
              <div
                className="absolute inset-0 scale-x-0 group-hover/logo:scale-x-100 transition-transform duration-500 origin-left bg-amber-500"
                style={{
                  WebkitMaskImage: "url('/img/Logo Evomi.png')",
                  maskImage: "url('/img/Logo Evomi.png')",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                }}
              />
            </Link>
          </div>

          {/* 2. SEKTOR TENGAH: NAV MENU DESKTOP UNDERLINE PROGRESS ORANGE */}
          <div
            className={`hidden md:flex w-1/2 justify-center items-center space-x-10 ${fontJudul.className} text-[13px] tracking-[0.2em] uppercase text-white`}
          >
            <Link
              href="/"
              className="relative group/nav py-1 transition-colors duration-300 hover:text-amber-400"
            >
              Home
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
            <Link
              href="/produk"
              className="relative group/nav py-1 transition-colors duration-300 text-amber-400"
            >
              Collection
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-100 origin-left" />
            </Link>
            <Link
              href="/quiz"
              className="relative group/nav py-1 transition-colors duration-300 hover:text-amber-400"
            >
              Quiz
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
            <Link
              href="/artikel"
              className="relative group/nav py-1 transition-colors duration-300 hover:text-amber-400"
            >
              Artikel
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
            <a
              href="#footer"
              className="relative group/nav py-1 transition-colors duration-300 hover:text-amber-400"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-300 origin-left" />
            </a>
          </div>

          {/* 3. SEKTOR KANAN: USER PROFILE / LOGIN REGISTER */}
          <div className="flex-1 md:w-1/3 flex justify-end items-center space-x-4">
            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="group/userbtn btn relative flex items-center space-x-3 border border-white/30 rounded-full p-1 pr-4 bg-white/10 transition-all duration-300 backdrop-blur-sm overflow-hidden z-0"
                  >
                    <div className="absolute inset-0 w-full h-full bg-amber-500 scale-x-0 group-hover/userbtn:scale-x-100 transition-transform duration-500 origin-left -z-10" />

                    <div className="w-8 h-8 rounded-full bg-white text-[#0071bc] flex items-center justify-center text-[10px] font-bold uppercase overflow-hidden relative z-10 transition-transform duration-300 group-hover/userbtn:scale-95">
                      {user.image !== "default-avatar.png" ? (
                        <img
                          src={BASE_URL + `/storage/profiles/${user.image}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-widest text-white relative z-10 transition-colors duration-300 group-hover/userbtn:text-stone-950">
                      {user.username}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-blue-50 py-2 z-50 overflow-hidden"
                      >
                        <Link
                          href="/profile"
                          className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-800 hover:bg-blue-50"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/orders"
                          className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-800 hover:bg-blue-50"
                        >
                          Orders
                        </Link>
                        <hr className="border-blue-50 my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-6">
                  <Link
                    href="/login"
                    className="relative group/auth py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:text-amber-400 transition-colors duration-300"
                  >
                    Login
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover/auth:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>
                  <Link
                    href="/register"
                    className="relative group/auth py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:text-amber-400 transition-colors duration-300"
                  >
                    Register
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover/auth:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-blue-100 focus:outline-none"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 8h16M4 16h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={mobileMenuVars}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden bg-[#0071bc] border-t border-white/10"
            >
              <div className="px-8 py-10 flex flex-col space-y-8">
                <div className="space-y-6">
                  {[
                    { name: "Home", href: "/" },
                    { name: "Collection", href: "/produk" },
                    { name: "Quiz", href: "/quiz" },
                    { name: "Artikel", href: "/artikel" },
                  ].map((link) => (
                    <motion.div key={link.name} variants={itemVars}>
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`${fontJudul.className} text-2xl tracking-[0.2em] text-white uppercase`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  variants={itemVars}
                  className="pt-8 border-t border-white/10"
                >
                  {user ? (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-white text-[#0071bc] flex items-center justify-center font-bold overflow-hidden">
                          {user.image !== "default-avatar.png" ? (
                            <img
                              src={BASE_URL + `/storage/profiles/${user.image}`}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <span className="text-white font-bold tracking-widest uppercase">
                          {user.username}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Link
                          href="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="px-4 py-3 bg-white/10 rounded-xl text-[10px] font-bold uppercase text-white text-center"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="px-4 py-3 bg-white/10 rounded-xl text-[10px] font-bold uppercase text-white text-center"
                        >
                          Orders
                        </Link>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full py-3 border border-red-400/50 rounded-xl text-[10px] font-bold uppercase text-red-300"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-4 bg-white text-[#0071bc] rounded-xl text-center text-[10px] font-bold uppercase tracking-widest"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-4 border border-white/30 text-white rounded-xl text-center text-[10px] font-bold uppercase tracking-widest"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HEADER SECTION */}
      <section className="pt-40 pb-16 px-6 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center space-x-4 mb-6"
          >
            <div className="w-8 md:w-12 h-[1px] bg-stone-300"></div>
            <span className="inline-block text-[10px] uppercase tracking-[0.5em] text-stone-400 font-bold">
              The Art of Fragrance
            </span>
            <div className="w-8 md:w-12 h-[1px] bg-stone-300"></div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className={`${fontJudul.className} text-5xl md:text-7xl text-stone-900 mb-6 leading-tight uppercase tracking-tight`}
          >
            Our Collections
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-stone-500 max-w-xl mx-auto leading-relaxed text-sm md:text-base font-light italic"
          >
            Dikurasi dengan bahan-bahan organik terbaik untuk menciptakan jejak
            aroma yang tak terlupakan. Temukan identitas Anda melalui koleksi
            kami.
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
                key={currentPage}
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
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (num) => (
                          <button
                            key={num}
                            onClick={() => paginate(num)}
                            className={`w-10 h-10 rounded-full text-[10px] font-bold tracking-widest transition-all duration-300 ${
                              currentPage === num
                                ? "bg-stone-900 text-white shadow-lg"
                                : "bg-transparent text-stone-400 hover:bg-stone-100 hover:text-stone-900"
                            }`}
                          >
                            {String(num).padStart(2, "0")}
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-3 text-stone-400 hover:text-stone-900 disabled:opacity-20 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M9 5l7 7-7 7"
                        />
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
            <Image
              src="/img/Logo Evomi.png"
              alt="Evomi"
              width={100}
              height={40}
              className="brightness-0"
            />
            <p className="max-w-sm text-stone-500 text-sm font-light leading-relaxed italic">
              "Redefining Presence through Scent." <br /> Identitas yang tidak
              terlihat namun paling berkesan.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-[11px] uppercase tracking-widest text-stone-800">
              Location
            </h4>
            <p className="text-stone-500 text-sm font-light leading-relaxed">
              Jakarta, Indonesia
              <br />
              Sudirman Central Business District
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-[11px] uppercase tracking-widest text-stone-800">
              Connect
            </h4>
            <div className="flex flex-col gap-3 text-sm font-light text-stone-500">
              <a href="#" className="hover:text-stone-900 transition-colors">
                Instagram
              </a>
              <a href="#" className="hover:text-stone-900 transition-colors">
                TikTok
              </a>
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
