"use client";

// React & Next
import Link from "next/link";
import Image from "next/image";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";
import { SocialIcon } from 'react-social-icons'

// ... import lainnya
import QuizModal from "@/components/QuizModal";

// Tambahkan import ChatModal di bagian atas
import ChatModal from "@/components/ChatModal";
import { BASE_URL } from "@/src/config/strings";
import { useState, useEffect, useRef } from "react";
import ImageCarousel from "@/components/ImageCarousel";
import WavyNavbarGradient from "@/components/WavyNavbarGradient";
import { motion, Variants, useScroll, useTransform, AnimatePresence } from "framer-motion";

// --- Animasi Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
  }
};

// Stagger Container
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    }
  }
};

// Font untuk judul
const fontJudul = localFont({
  src: "./fonts/8 Heavy.ttf",
  variable: "--font-brand",
  display: "swap",
});

// Font untuk caption
const fontCaption = localFont({
  src: "./fonts/Nohemi-Regular.otf",
  variable: "--font-body",
  display: "swap",
});

// =========================================================================
// --- UPDATE: Seamless Looping Wavy Curve (Ukuran Lebih Kecil/Tipis) ---
// =========================================================================
// const WavyNavbarGradient = () => (
//   <div className="absolute inset-x-0 bottom-0 h-6 overflow-hidden -mb-px z-10 pointer-events-none">
//     <svg
//       viewBox="0 0 1440 120"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//       className="absolute bottom-0 w-[200%] h-full animate-wave-horizontal"
//       preserveAspectRatio="none"
//     >
//       <motion.path
//         animate={{
//           d: [
//             // Posisi Start: Amplitudo diperkecil (range Y 70-90)
//             "M0,80 C240,95 480,65 720,80 C960,95 1200,65 1440,80 L1440,120 L0,120 Z",
//             // Posisi Tengah: Lekukan berbalik secara halus
//             "M0,80 C240,65 480,95 720,80 C960,65 1200,95 1440,80 L1440,120 L0,120 Z",
//             // Posisi End: Kembali ke posisi awal agar loop tidak patah
//             "M0,80 C240,95 480,65 720,80 C960,95 1200,65 1440,80 L1440,120 L0,120 Z"
//           ]
//         }}
//         transition={{
//           duration: 10, // Durasi sedikit diperlambat agar lebih tenang
//           ease: "easeInOut",
//           repeat: Infinity,
//         }}
//         fill="url(#waveGradient)"
//       />

//       {/* Path kedua sebagai penyambung horizontal */}
//       <motion.path
//         animate={{
//           d: [
//             "M1440,80 C1680,95 1920,65 2160,80 C2400,95 2640,65 2880,80 L2880,120 L1440,120 Z",
//             "M1440,80 C1680,65 1920,95 2160,80 C2400,65 2640,95 2880,80 L2880,120 L1440,120 Z",
//             "M1440,80 C1680,95 1920,65 2160,80 C2400,95 2640,65 2880,80 L2880,120 L1440,120 Z"
//           ]
//         }}
//         transition={{
//           duration: 10,
//           ease: "easeInOut",
//           repeat: Infinity,
//         }}
//         fill="url(#waveGradient)"
//       />

//       <defs>
//         <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
//           <stop offset="0%" stopColor="#005fa3" />
//           <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
//           <stop offset="100%" stopColor="#0071bc" />
//         </linearGradient>
//       </defs>
//     </svg>

//     <style jsx global>{`
//       @keyframes wave-move-seamless {
//         0% { transform: translateX(0); }
//         100% { transform: translateX(-50%); }
//       }
//       .animate-wave-horizontal {
//         animation: wave-move-seamless 20s linear infinite; /* Gerakan horizontal lebih lambat */
//       }
//     `}</style>
//   </div>
// );
// =========================================================================

// Component utama
export default function EvomiLandingPage() {

  const router = useRouter();
  const [user, setUser] = useState<{
    id: any; email: string; name: string; username: string; image: string;
  } | null>(null);  // State untuk menyimpan data user yang login

  const [isMenuOpen, setIsMenuOpen] = useState(false);  // State untuk menu dropdown user
  const [products, setProducts] = useState<any[]>([]);  // State untuk menyimpan data produk yang di-fetch
  const [mounted, setMounted] = useState(false);  // State untuk memastikan komponen sudah mount sebelum render (untuk menghindari masalah SSR)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);  // State untuk menu mobile
  const [isQuizOpen, setIsQuizOpen] = useState(false);  // State untuk membuka/menutup modal quiz

  // Di dalam component EvomiLandingPage(), tambahkan state ini di bawah state isQuizOpen:
  const [isChatOpen, setIsChatOpen] = useState(false);

  // --- Parallax Hooks ---
  const heroRef = useRef(null);
  const { scrollYProgress: heroScrollY } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"], // Mulai parallax saat bagian atas hero masuk viewport, dan berakhir saat bagian bawah hero mencapai bagian atas viewport
  });

  // Teks turun lebih lambat dari scroll (efek tertinggal)
  const heroTextY = useTransform(heroScrollY, [0, 1], ["0%", "60%"]);

  // Background turun sedikit agar terlihat berdimensi
  const heroBgY = useTransform(heroScrollY, [0, 1], ["0%", "20%"]);

  // Testimonial section parallax
  const testimonialRef = useRef(null);

  // scrollYProgress untuk testimonial, dengan offset yang lebih panjang agar efek parallax terasa saat masuk dan keluar section
  const { scrollYProgress: testimonialScrollY } = useScroll({
    target: testimonialRef,
    offset: ["start end", "end start"],
  });

  // Cahaya blur bergerak naik turun saat scroll
  const testimonialGlowY = useTransform(testimonialScrollY, [0, 1], ["-40%", "40%"]);
  // ----------------------

  // Hero slides
  const heroSlides = [
    { tagline: "The Artisan Fragrance House", title: "EVOMI", desc: "Kurasi aroma yang melampaui waktu." },
    { tagline: "Every Version of Me", title: "ESSENCE", desc: "Menemukan jati diri melalui setiap semprotan." },
    { tagline: "Unisex & Long Lasting", title: "CRAFTED", desc: "Ketahanan aroma hingga 12 jam lebih." },
  ];

  // State untuk slide hero
  const [currentSlide, setCurrentSlide] = useState(0);

  // Effect untuk auto-slide hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Berganti setiap 5 detik
    return () => clearInterval(timer);
  }, []);

  // Effect untuk inisialisasi
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("access_token"); // Cek token untuk menentukan apakah user sudah login
    const savedUser = localStorage.getItem("user_data");  // Ambil data user yang disimpan di localStorage
    if (token && savedUser) {
      // Pastikan data user yang diambil dari localStorage valid sebelum diset ke state
      try {
        setUser(JSON.parse(savedUser));
        console.log("User loaded:", JSON.parse(savedUser));
      } catch (error) {
        console.error(error);
      }
    }

    // Fetch products
    const fetchProducts = async () => {
      try {
        const response = await fetch(BASE_URL + "/api/products", { headers: { Accept: "application/json" } });
        const result = await response.json();
        setProducts(result.data ? result.data : result);
      } catch (error) { console.error(error); }
    };
    fetchProducts();
  }, []);

  // Tambahkan di dalam komponen EvomiLandingPage()
  // Status user online / offline, saat user menutup browser
  useEffect(() => {
    if (!user) return;

    // 1. Set status ONLINE saat masuk halaman
    const setStatus = async (status: number) => {
      try {
        await fetch(`${BASE_URL}/api/user/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`
          },
          body: JSON.stringify({ is_online: status })
        });
      } catch (err) {
        console.error("Gagal update status:", err);
      }
    };

    setStatus(1); // Set Online

    // 2. Set status OFFLINE saat browser ditutup
    const handleVisibilityChange = () => {
      // navigator.sendBeacon tetap berjalan meskipun tab sudah tertutup
      if (document.visibilityState === 'hidden') {
        const url = `${BASE_URL}/api/user/status-beacon`;
        const data = JSON.stringify({
          user_id: user.id, // Pastikan user object punya ID
          is_online: 0
        });
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      }
    };

    // Kita gunakan beforeunload untuk browser close
    const handleUnload = () => {
      const url = `${BASE_URL}/api/user/status-beacon`;
      const data = JSON.stringify({ user_id: user.id, is_online: 0 });
      const blob = new Blob([data], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    };

    // Event untuk tab visibility change (pindah tab) dan browser close
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      // Pastikan status OFFLINE saat komponen unmount (misal user logout atau pindah halaman)
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [user]);


  // Handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(BASE_URL + "/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
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

  // Component untuk section divider (garis pembatas antar section)
  const SectionDivider = () => (
    <div className="max-w-7xl mx-auto px-6 md:px-8">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="h-[1px] w-full bg-stone-200 origin-left"
      />
    </div>
  );

  // Mobile Menu Vars
  const mobileMenuVars: Variants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.5,
        ease: [0.21, 0.47, 0.32, 0.98],
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  // Item Vars untuk menu mobile
  const itemVars: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  // Get top 4 products
  const topFourProducts = products.slice(0, 4);

  return (
    <div style={{ opacity: mounted ? 1 : 0 }} className={`${fontCaption.variable} ${fontJudul.variable} selection:bg-amber-200 selection:text-stone-900 transition-opacity duration-500`}>

      {/* FLOATING ACTION BUTTON (CHAT MODAL TRIGGER) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8, type: "spring", bounce: 0.5 }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[90]"
      >
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="relative flex items-center justify-center w-14 h-14 bg-stone-900 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 group"
        >
          {/* Animasi ping (pulse) */}
          {!isChatOpen && (
            <span className="absolute inset-0 rounded-full bg-stone-500 opacity-20 animate-ping group-hover:animate-none"></span>
          )}

          {/* Ikon Chat Custom (Menggantikan SocialIcon) */}
          <svg className="w-6 h-6 text-[#FBFBF9] relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>

          {/* Tooltip Hover */}
          <span className="absolute right-16 px-4 py-2.5 bg-white text-stone-800 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 shadow-xl border border-stone-100 whitespace-nowrap translate-x-2 group-hover:translate-x-0">
            {isChatOpen ? "Close Chat" : "Chat Admin"}
          </span>
        </button>
      </motion.div>

      {/* Render Komponen Modal Chat */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Komponen Modal */}
      <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />

      <div className="min-h-screen bg-[#FBFBF9] text-stone-900 font-sans antialiased">

        {/* ========================================================================= */}
        {/* NAVBAR: Modifikasi untuk Menambahkan Wavy Animated Gradient */}
        {/* ========================================================================= */}
        <nav className="fixed w-full z-[100] bg-[#0071bc]/95 backdrop-blur-xl border-b border-white/10 shadow-lg transition-all duration-300 overflow-visible">

          {/* BARU: Memanggil Komponen Wavy Curve */}
          <WavyNavbarGradient />

          <div className="max-w-7xl mx-auto px-6 md:px-8 h-20 flex items-center justify-between relative z-20"> {/* Tambahkan relative z-20 agar konten navbar di atas wave */}

            {/* Logo Section tetap sama */}
            <div className="flex-1 md:w-1/2 flex justify-start relative z-10">
              <Link href="/" className="hover:opacity-70 transition-opacity">
                <Image src="/img/Logo Evomi.png" alt="Evomi Logo" width={90} height={36} className="brightness-0 invert drop-shadow-sm" />
              </Link>
            </div>

            {/* Desktop Menu Section tetap sama */}
            <div className={`hidden md:flex w-1/2 justify-center items-center space-x-10 ${fontJudul.className} text-[13px] tracking-[0.2em] uppercase text-white relative z-10`}>
              <a href="#about" className="hover:text-blue-200 transition-colors">About</a>
              <a href="#product" className="hover:text-blue-200 transition-colors">Collection</a>
              <Link href="/produk" className="hover:text-blue-200 transition-colors">Shop</Link>
              <button onClick={() => setIsQuizOpen(true)} className="hover:text-blue-200 transition-colors uppercase">Quiz</button>
              <Link href="/artikel" className="hover:text-blue-200 transition-colors">Artikel</Link>
            </div>

            {/* Right Actions tetap sama */}
            <div className="flex-1 md:w-1/3 flex justify-end items-center space-x-4 relative z-10">
              <div className="hidden md:flex items-center space-x-6">
                {user ? (
                  <div className="relative">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-3 border border-white/30 rounded-full p-1 pr-4 bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm relative z-10">
                      <div className="w-8 h-8 rounded-full bg-white text-[#0071bc] flex items-center justify-center text-[10px] font-bold uppercase overflow-hidden">
                        {user.image !== 'default-avatar.png' ? (
                          <img src={BASE_URL + `/storage/profiles/${user.image}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (user.name.charAt(0))}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white">{user.username}</span>
                    </button>
                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-blue-50 py-2 z-[110] overflow-hidden">
                          <Link href="/profile" className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-800 hover:bg-blue-50">Profile</Link>
                          <Link href="/orders" className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-800 hover:bg-blue-50">Orders</Link>
                          <hr className="border-blue-50 my-1" />
                          <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50">Logout</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center space-x-6 relative z-10">
                    <Link href="/login" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:text-blue-100">Login</Link>
                    <Link href="/register" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:text-blue-100">Register</Link>
                  </div>
                )}
              </div>

              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-white hover:text-blue-100 focus:outline-none relative z-10">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />) : (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />)}
                </svg>
              </button>
            </div>
          </div>

          {/* MOBILE DROPDOWN MENU tetap sama */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div variants={mobileMenuVars} initial="hidden" animate="visible" exit="exit" className="md:hidden bg-[#0071bc] border-t border-white/10 overflow-hidden relative z-50">
                <div className="px-8 py-10 flex flex-col space-y-8">
                  <div className="space-y-6">
                    {[{ name: "About", href: "#about" }, { name: "Collection", href: "#product" }, { name: "Shop", href: "/produk" }].map((link) => (
                      <motion.div key={link.name} variants={itemVars}>
                        <Link href={link.href} onClick={() => setIsMobileMenuOpen(false)} className={`${fontJudul.className} text-2xl tracking-[0.2em] text-white uppercase`}>
                          {link.name}
                        </Link>
                      </motion.div>
                    ))}
                    <motion.div variants={itemVars}>
                      <button onClick={() => { setIsQuizOpen(true); setIsMobileMenuOpen(false); }} className={`${fontJudul.className} text-2xl tracking-[0.2em] text-white uppercase`}>
                        Quiz
                      </button>
                    </motion.div>
                    <motion.div variants={itemVars}>
                      <Link href="/artikel" onClick={() => setIsMobileMenuOpen(false)} className={`${fontJudul.className} text-2xl tracking-[0.2em] text-white uppercase`}>
                        Artikel
                      </Link>
                    </motion.div>
                  </div>

                  <motion.div variants={itemVars} className="pt-8 border-t border-white/10 relative z-10">
                    {user ? (
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-white text-[#0071bc] flex items-center justify-center font-bold">
                            {user.image !== 'default-avatar.png' ? (<img src={BASE_URL + `/storage/profiles/${user.image}`} alt="Profile" className="w-full h-full object-cover rounded-full" />) : (user.name.charAt(0))}
                          </div>
                          <span className="text-white font-bold tracking-widest uppercase">{user.username}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-white/10 rounded-xl text-[10px] font-bold uppercase text-white text-center">Profile</Link>
                          <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-white/10 rounded-xl text-[10px] font-bold uppercase text-white text-center">Orders</Link>
                        </div>
                        <button onClick={handleLogout} className="w-full py-3 border border-red-400/50 rounded-xl text-[10px] font-bold uppercase text-red-300 relative z-10">Logout</button>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-4">
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-4 bg-white text-[#0071bc] rounded-xl text-center text-[10px] font-bold uppercase tracking-widest">Login</Link>
                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-4 border border-white/30 text-white rounded-xl text-center text-[10px] font-bold uppercase tracking-widest">Register</Link>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* HERO SECTION WITH PARALLAX */}
        <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-20">
          <motion.div style={{ y: heroBgY }} className="absolute inset-0 bg-gradient-to-b from-[#FBFBF9] via-stone-50 to-[#F5F5F0] opacity-80 scale-125 origin-top" />
          <motion.div style={{ y: heroTextY }} className="relative z-10 text-center space-y-6 md:space-y-8 max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="space-y-6"
              >
                <p className="text-stone-400 tracking-[0.5em] uppercase text-xl font-semibold">
                  {heroSlides[currentSlide].tagline}
                </p>
                <h1 className={`${fontJudul.className} text-4xl md:text-[130px] uppercase text-stone-900 drop-shadow-sm`}>
                  {heroSlides[currentSlide].title}
                </h1>
                <p className="text-stone-500 italic max-w-xl mx-auto text-xl md:text-base">
                  {heroSlides[currentSlide].desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* CTA BUTTON - Tetap statis di bawah slider atau ikut slide */}
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex justify-center pt-4">
              <Link href="/produk" className="group relative inline-flex items-center justify-center px-8 py-3.5 text-xs font-bold tracking-widest text-white uppercase bg-stone-900 rounded-full overflow-hidden shadow-lg transition-all duration-300">
                <span className="relative z-10 group-hover:text-amber-100">Explore Collection</span>
                <div className="absolute inset-0 bg-stone-800 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </Link>
            </motion.div>

            {/* SLIDER INDICATORS */}
            <div className="flex justify-center space-x-3 pt-8">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 transition-all duration-500 rounded-full ${currentSlide === index ? "w-8 bg-stone-900" : "w-4 bg-stone-300"
                    }`}
                />
              ))}
            </div>
          </motion.div>
        </section>

        {/* ABOUT SECTION */}
        <motion.section
          id="about"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="relative py-24 md:py-32 px-6 md:px-8 max-w-7xl mx-auto z-20 bg-[#FBFBF9]"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start">
            <div className="md:col-span-5 text-center md:text-left">
              <h2 className={`${fontJudul.className} text-4xl md:text-5xl text-stone-900 leading-[1.1] uppercase`}>Crafting <br className="hidden md:block" /> Memories</h2>
              <div className="w-12 h-[2px] bg-amber-800/30 mt-6 mx-auto md:mx-0"></div>
            </div>
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-14 pt-2">
              <div className="space-y-4 group">
                <h3 className="font-bold text-stone-800 uppercase tracking-[0.2em] text-[10px] flex items-center gap-3">
                  <span className="w-4 h-[1px] bg-stone-300 group-hover:bg-amber-800 group-hover:w-8 transition-all duration-300"></span>
                  Pionir Wewangian
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed font-light">Evomi memadukan botani langka dengan teknik ekstraksi modern untuk menghasilkan karakter aroma unik yang mendalam.</p>
              </div>
              <div className="space-y-4 group">
                <h3 className="font-bold text-stone-800 uppercase tracking-[0.2em] text-[10px] flex items-center gap-3">
                  <span className="w-4 h-[1px] bg-stone-300 group-hover:bg-amber-800 group-hover:w-8 transition-all duration-300"></span>
                  Eksklusivitas
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed font-light">Setiap batch diproduksi dalam jumlah terbatas untuk menjamin kualitas dan kemurnian material organik tetap terjaga sempurna.</p>
              </div>
            </div>
          </div>
        </motion.section>

        <SectionDivider /> {/* Divider setelah about */}

        {/* CAROUSEL POSTER */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="relative py-10 md:py-20 px-6 md:px-16 z-20 bg-[#FBFBF9]"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16 md:mb-24 space-y-4"
            >
              <h2 className={`${fontJudul.className} text-3xl md:text-5xl uppercase tracking-tight text-stone-800`}>Product Characters</h2>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-8 md:w-12 h-[1px] bg-stone-200"></div>
                <p className="text-stone-400 tracking-[0.25em] uppercase text-[9px] md:text-xs font-semibold">Collections</p>
                <div className="w-8 md:w-12 h-[1px] bg-stone-200"></div>
              </div>
            </motion.div>
            <ImageCarousel />
          </div>
        </motion.section>

        {/* PRODUCT GRID */}
        <section id="product" className="relative py-20 md:py-32 px-4 md:px-8 bg-white border-y border-stone-100 shadow-[0_0_50px_rgba(0,0,0,0.02)] z-20">
          <div className="max-w-7xl mx-auto">

            {/* Judul Produk */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16 md:mb-24 space-y-4"
            >
              <h2 className={`${fontJudul.className} text-3xl md:text-5xl uppercase tracking-tight text-stone-800`}>Signature Essence</h2>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-8 md:w-12 h-[1px] bg-stone-200"></div>
                <p className="text-stone-400 tracking-[0.25em] uppercase text-[9px] md:text-xs font-semibold">Featured Collection</p>
                <div className="w-8 md:w-12 h-[1px] bg-stone-200"></div>
              </div>
            </motion.div>

            {/* Product Grid */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
            >
              {topFourProducts.map((parfum) => (
                <motion.div key={parfum.id} variants={fadeInUp} className="group flex flex-col h-full">
                  <div className="relative aspect-[4/5] overflow-hidden bg-stone-50 mb-5 rounded-2xl border border-stone-100 shadow-sm group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500">
                    <Image src={parfum.image_url || "/img/placeholder.jpg"} alt={parfum.nama} fill unoptimized className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <Link href={`/produk/${parfum.id}`} className="absolute inset-0 z-10 opacity-0 md:group-hover:opacity-100 bg-stone-900/10 backdrop-blur-[2px] transition-all duration-500 flex items-end p-4">
                      <div className="w-full bg-white/95 backdrop-blur-md py-3.5 text-[10px] uppercase font-bold tracking-widest text-center text-stone-800 translate-y-4 group-hover:translate-y-0 transition-all duration-500 rounded-xl shadow-lg hover:bg-stone-900 hover:text-white">Discover</div>
                    </Link>
                  </div>
                  <div className="text-center space-y-2 px-2 flex-grow flex flex-col justify-end">
                    <span className="text-[8px] md:text-[10px] text-stone-400 uppercase tracking-[0.2em] font-medium">Unisex • {parfum.ukuran}</span>
                    <h3 className={`${fontJudul.className} text-base md:text-xl text-stone-800 uppercase leading-snug line-clamp-1 group-hover:text-amber-800 transition-colors`}>{parfum.nama}</h3>
                    <p className="text-stone-600 font-medium text-[11px] md:text-sm tracking-wide">Rp {Number(parfum.harga_retail).toLocaleString("id-ID")}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-16 text-center">
              <Link href="/produk" className="inline-block border-b border-stone-300 pb-1 text-xs uppercase tracking-widest font-bold text-stone-500 hover:text-stone-900 hover:border-stone-900 transition-all">View All Collection</Link>
            </motion.div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="relative py-20 md:py-28 bg-[#FBFBF9] px-6 text-center z-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12"
          >
            {[
              { title: "12H+", desc: "Projection" },
              { title: "Artisan", desc: "Batch" },
              { title: "Recycled", desc: "Glass" },
              { title: "Organic", desc: "Essence" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="group">
                <div className={`${fontJudul.className} text-3xl md:text-4xl mb-2 text-stone-300 group-hover:text-stone-800 transition-colors duration-500`}>{item.title}</div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* TESTIMONIAL SECTION WITH PARALLAX */}
        <section
          ref={testimonialRef}
          className="relative py-24 md:py-32 bg-stone-950 text-white px-6 overflow-hidden z-20"
        >
          {/* Pastikan section ini 'relative' agar koordinat 'testimonialGlowY' dihitung dari sini */}
          <motion.div
            style={{ y: testimonialGlowY }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-stone-800/30 blur-[120px] rounded-full pointer-events-none"
          />
          <div className="max-w-6xl mx-auto text-center space-y-16 md:space-y-24 relative z-10">
            <motion.h2 initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className={`${fontJudul.className} text-3xl md:text-5xl italic leading-tight text-stone-100 font-light`}>
              "The scent of a woman, <br /> The presence of a soul."
            </motion.h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left"
            >
              {[
                { name: "Clara S.", text: "Peaceful Calm adalah aroma paling segar yang pernah saya miliki. Menyatu sempurna dengan kulit." },
                { name: "Dimas R.", text: "Rabel Brave sangat memikat perhatian di malam hari. Projection-nya luar biasa tahan lama." },
                { name: "Sarah W.", text: "Packaging Evomi sangat mewah, benar-benar brand berkelas internasional dari lokal." },
              ].map((t, i) => (
                <motion.div key={i} variants={fadeInUp} className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:bg-white/[0.06] transition-colors duration-300 flex flex-col justify-between space-y-6">
                  <p className="text-stone-300 text-sm md:text-base font-light italic leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-[10px] font-bold text-stone-400 uppercase">{t.name.charAt(0)}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-100">{t.name}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FOOTER */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative z-20 bg-white pt-20 pb-10 px-6 md:px-8 border-t border-stone-100"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-12 mb-16">
            <div className="md:col-span-5">
              <h2 className={`${fontJudul.className} text-3xl mb-5 tracking-widest text-stone-900`}>EVOMI</h2>
              <p className="max-w-sm text-stone-500 text-sm font-light leading-relaxed">Menghadirkan pengalaman sensorik melalui kurasi aroma terbaik. Dedikasi pada seni artisan fragrance.</p>
            </div>
            <div className="md:col-span-3">
              <h4 className="font-bold text-[11px] uppercase tracking-widest mb-6 text-stone-800">Contact Us</h4>
              <ul className="text-stone-500 space-y-3 text-sm font-light">
                <li className="hover:text-stone-900 transition-colors cursor-pointer">hello@evomi.com</li>
                <li>Jakarta, Indonesia</li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <h4 className="font-bold text-[11px] uppercase tracking-widest mb-6 text-stone-800">The Newsletter</h4>
              <p className="text-stone-400 text-xs mb-4">Dapatkan akses eksklusif ke rilis terbaru kami.</p>
              <div className="flex border-b border-stone-300 pb-2 focus-within:border-stone-900 transition-colors">
                <input type="email" placeholder="Your email address" className="bg-transparent w-full text-sm outline-none text-stone-800 placeholder-stone-400" />
                <button className="text-[10px] uppercase font-bold text-stone-800 hover:text-amber-800 transition-colors tracking-wider">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-around items-center text-center text-[10px] text-stone-400 uppercase tracking-[0.2em] pt-8 border-t border-stone-100 gap-4">

            {/* Year and Company Name */}
            <div>
              &copy; {mounted ? new Date().getFullYear() : "2026"} EVOMI FRAGRANCE HOUSE
            </div>

            <div className="flex space-x-6">

              {/* Instagram */}
              <SocialIcon
                url="https://instagram.com/evomi"
                network="instagram"
                fgColor="currentColor"
                bgColor="transparent"
                className="hover:text-stone-900 transition-colors"
                style={{ height: 25, width: 25 }} // Ukuran ikon disesuaikan agar proporsional dengan teks [10px]
              />

              {/* TikTok */}
              <SocialIcon
                url="https://tiktok.com/@evomi"
                network="tiktok"
                fgColor="currentColor"
                bgColor="transparent"
                className="hover:text-stone-900 transition-colors"
                style={{ height: 25, width: 25 }}
              />
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}