"use client";

// React & Next
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SocialIcon } from 'react-social-icons';
import { motion, Variants, AnimatePresence } from "framer-motion";

// Komponen Modal & Config (Sesuaikan path import Anda)
import QuizModal from "@/components/QuizModal";
import ChatModal from "@/components/ChatModal";
import { BASE_URL } from "@/src/config/strings";

// --- Animasi Variants ---
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
    }
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const mobileMenuVars: Variants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
        opacity: 1,
        height: "auto",
        transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98], staggerChildren: 0.1, delayChildren: 0.1 }
    },
    exit: { opacity: 0, height: 0, transition: { duration: 0.3, ease: "easeInOut" } }
};

const itemVars: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
};

// --- Fonts ---
// Catatan: sesuaikan path "./fonts/..." menjadi "../fonts/..." jika file ini berada di dalam folder /artikel
const fontJudul = localFont({
    src: "../fonts/8 Heavy.ttf",
    variable: "--font-brand",
    display: "swap",
});

const fontCaption = localFont({
    src: "../fonts/Nohemi-Regular.otf",
    variable: "--font-body",
    display: "swap",
});


export default function ArtikelPage() {
    const router = useRouter();
    const [articles, setArticles] = useState<any[]>([]); // Ganti dummyArticles[cite: 4]
    const [isLoading, setIsLoading] = useState(true);

    // States untuk Navbar & Global
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<{
        id: any; email: string; name: string; username: string; image: string;
    } | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 6;

    // Hitung total page
    const totalPages = Math.ceil(articles.length / articlesPerPage);

    // Data artikel per page
    const indexOfLastArticle = currentPage * articlesPerPage;
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
    const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);

    // Function pindah page
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Inisialisasi User
    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("access_token");
        const savedUser = localStorage.getItem("user_data");
        if (token && savedUser) {
            try { setUser(JSON.parse(savedUser)); } catch (error) { console.error(error); }
        }
    }, []);

    // Fetch Data dari API
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/articles`);
                const result = await response.json();
                if (result.success) {
                    setArticles(result.data);
                }
            } catch (error) {
                console.error("Gagal mengambil data artikel:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticles();
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

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [user]);

    // --- HELPER FUNCTION: Membersihkan HTML dari React Quill ---
    const getExcerpt = (htmlContent: string, maxLength: number = 120) => {
        if (!htmlContent) return "";

        // 1. Menghapus semua tag HTML
        // 2. Mengganti &nbsp; dengan spasi biasa
        // 3. Mengganti spasi ganda hasil pembersihan tag
        const plainText = htmlContent
            .replace(/<[^>]*>?/gm, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        return plainText.length > maxLength
            ? plainText.substring(0, maxLength) + "..."
            : plainText;
    };

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

    if (!mounted) return null;

    return (
        <div className={`${fontCaption.variable} ${fontJudul.variable} min-h-screen bg-[#FBFBF9] text-stone-900 font-sans antialiased selection:bg-amber-200 selection:text-stone-900`}>

            {/* MODALS */}
            <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
            <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

            {/* FLOATING CHAT BUTTON */}
            <motion.div initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1, duration: 0.8, type: "spring" }} className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[90]">
                <button onClick={() => setIsChatOpen(!isChatOpen)} className="relative flex items-center justify-center w-14 h-14 bg-stone-900 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    {!isChatOpen && <span className="absolute inset-0 rounded-full bg-stone-500 opacity-20 animate-ping group-hover:animate-none"></span>}
                    <svg className="w-6 h-6 text-[#FBFBF9] relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                </button>
            </motion.div>

            {/* NAVBAR */}
            <nav className="fixed w-full z-[100] bg-[#0071bc]/95 backdrop-blur-xl border-b border-white/10 shadow-lg transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
                    <div className="flex-1 md:w-1/3 flex justify-start">
                        <Link href="/" className="hover:opacity-70 transition-opacity">
                            <Image src="/img/Logo Evomi.png" alt="Evomi Logo" width={90} height={36} className="brightness-0 invert drop-shadow-sm" />
                        </Link>
                    </div>

                    <div className={`hidden md:flex w-1/3 justify-center items-center space-x-10 ${fontJudul.className} text-[13px] tracking-[0.2em] uppercase text-white`}>
                        {/* Pakai /#about agar kembali ke home lalu scroll */}
                        <Link href="/produk" className="hover:text-blue-200 transition-colors">Shop</Link>
                        <button onClick={() => setIsQuizOpen(true)} className="hover:text-blue-200 transition-colors uppercase">Quiz</button>
                        <Link href="/artikel" className="text-blue-200 transition-colors">Artikel</Link>
                    </div>

                    <div className="flex-1 md:w-1/3 flex justify-end items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-6">
                            {user ? (
                                <div className="relative">
                                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-3 border border-white/30 rounded-full p-1 pr-4 bg-white/10 hover:bg-white/20 transition-all">
                                        <div className="w-8 h-8 rounded-full bg-white text-[#0071bc] flex items-center justify-center text-[10px] font-bold uppercase overflow-hidden">
                                            {user.image !== 'default-avatar.png' ? (
                                                <img src={`https://ramadhan.alwaysdata.net/storage/profiles/${user.image}`} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (user.name.charAt(0))}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">{user.username}</span>
                                    </button>
                                    <AnimatePresence>
                                        {isMenuOpen && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-blue-50 py-2 z-50 overflow-hidden">
                                                <Link href="/profile" className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-800 hover:bg-blue-50">Profile</Link>
                                                <Link href="/orders" className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-800 hover:bg-blue-50">Orders</Link>
                                                <hr className="border-blue-50 my-1" />
                                                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50">Logout</button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-6">
                                    <Link href="/login" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:text-blue-100">Login</Link>
                                    <Link href="/register" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:text-blue-100">Register</Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Trigger */}
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-white hover:text-blue-100">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />) : (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />)}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* MOBILE MENU */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div variants={mobileMenuVars} initial="hidden" animate="visible" exit="exit" className="md:hidden bg-[#0071bc] border-t border-white/10 overflow-hidden">
                            <div className="px-8 py-10 flex flex-col space-y-8">
                                <div className="space-y-6">
                                    {[
                                        { name: "Shop", href: "/produk" },
                                        { name: "Artikel", href: "/artikel" },
                                    ].map((link) => (
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
                                </div>

                                {/* User Section for Mobile */}
                                <motion.div variants={itemVars} className="pt-8 border-t border-white/10">
                                    {user ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-full bg-white text-[#0071bc] flex items-center justify-center font-bold">
                                                    {user.image !== 'default-avatar.png' ? <img src={`https://ramadhan.alwaysdata.net/storage/profiles/${user.image}`} alt="Profile" className="w-full h-full object-cover rounded-full" /> : user.name.charAt(0)}
                                                </div>
                                                <span className="text-white font-bold tracking-widest uppercase">{user.username}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Link href="/profile" className="px-4 py-3 bg-white/10 rounded-xl text-[10px] font-bold uppercase text-white text-center">Profile</Link>
                                                <Link href="/orders" className="px-4 py-3 bg-white/10 rounded-xl text-[10px] font-bold uppercase text-white text-center">Orders</Link>
                                            </div>
                                            <button onClick={handleLogout} className="w-full py-3 border border-red-400/50 rounded-xl text-[10px] font-bold uppercase text-red-300">Logout</button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col space-y-4">
                                            <Link href="/login" className="w-full py-4 bg-white text-[#0071bc] rounded-xl text-center text-[10px] font-bold uppercase tracking-widest">Login</Link>
                                            <Link href="/register" className="w-full py-4 border border-white/30 text-white rounded-xl text-center text-[10px] font-bold uppercase tracking-widest">Register</Link>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* --- KONTEN HALAMAN ARTIKEL MULAI DARI SINI --- */}

            {/* HEADER PAGE */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.p initial={{ opacity: 0, letterSpacing: "0.2em" }} animate={{ opacity: 1, letterSpacing: "0.5em" }} transition={{ duration: 1 }} className="text-stone-400 uppercase text-xs font-bold mb-6">
                        Evomi Journal
                    </motion.p>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className={`${fontJudul.className} text-5xl md:text-7xl uppercase text-stone-900`}>
                        ARTIKEL & <br />CERITA
                    </motion.h1>
                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.5 }} className="h-[1px] w-24 bg-amber-800/30 mx-auto mt-8 origin-center" />
                </div>
            </section>

            {/* ARTICLES GRID */}
            <section className="max-w-7xl mx-auto px-6 md:px-8 pb-32">
                {isLoading ? (
                    <div className="text-center py-20 text-stone-400 uppercase tracking-widest text-xs">Memuat Cerita...</div>
                ) : (
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {currentArticles.map((article) => (
                            <motion.article key={article.id} className="group cursor-pointer">

                                {/* Gunakan slug untuk Link jika tersedia, fallback ke ID */}
                                <Link href={`/artikel/${article.id}`} className="block">
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-6 bg-stone-100 shadow-sm border border-stone-100">
                                        <Image
                                            src={article.image_url || "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800"}
                                            alt={article.title}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        {article.slug && (
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                                                <span className="text-[9px] font-bold tracking-widest text-stone-800 uppercase">{article.slug}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                                                {new Date(article.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                            <span className="text-[9px] text-amber-800/60 font-bold uppercase tracking-tighter italic">{article.author || 'Evomi Editorial'}</span>
                                        </div>

                                        <h3 className="text-xl md:text-2xl text-stone-800 uppercase leading-snug group-hover:text-amber-800 transition-colors font-bold tracking-tight">
                                            {article.title}
                                        </h3>

                                        {/* DESKRIPSI: Sudah dibersihkan dari HTML Quill */}
                                        <p className="text-stone-500 text-sm leading-relaxed font-light line-clamp-3">
                                            {getExcerpt(article.content)}
                                        </p>

                                        <div className="pt-4">
                                            <p className="inline-block text-[10px] uppercase tracking-widest font-bold text-stone-800 border-b border-stone-200 pb-1 group-hover:border-stone-900 transition-all">
                                                Read Story
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.article>
                        ))}
                    </motion.div>
                )}
            </section>

            {/* Pagination */}
            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
                <div className="flex flex-col items-center mt-20 pb-32 space-y-6">
                    {/* Garis Dekoratif Kecil */}
                    <div className="h-[1px] w-24 bg-stone-200"></div>

                    <div className="flex items-center space-x-2">
                        
                        {/* Prev Button */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-3 text-stone-400 hover:text-stone-900 disabled:opacity-20 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Number Buttons */}
                        <div className="flex space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handlePageChange(num)}
                                    className={`w-10 h-10 rounded-full text-[10px] font-bold tracking-widest transition-all duration-300 ${currentPage === num
                                        ? "bg-stone-900 text-white shadow-lg"
                                        : "bg-transparent text-stone-400 hover:bg-stone-100 hover:text-stone-900"
                                        }`}
                                >
                                    {String(num).padStart(2, '0')}
                                </button>
                            ))}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-3 text-stone-400 hover:text-stone-900 disabled:opacity-20 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Page Indicator */}
                    <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold">
                        Journal Page {currentPage} of {totalPages}
                    </p>
                </div>
            )}

            {/* --- FOOTER SAMA DENGAN LANDING PAGE --- */}
            <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="relative z-20 bg-white pt-20 pb-10 px-6 md:px-8 border-t border-stone-100">
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
                    <div>&copy; {new Date().getFullYear()} EVOMI FRAGRANCE HOUSE</div>
                    <div className="flex space-x-6">
                        <SocialIcon url="https://instagram.com/evomi" network="instagram" fgColor="currentColor" bgColor="transparent" className="hover:text-stone-900 transition-colors" style={{ height: 25, width: 25 }} />
                        <SocialIcon url="https://tiktok.com/@evomi" network="tiktok" fgColor="currentColor" bgColor="transparent" className="hover:text-stone-900 transition-colors" style={{ height: 25, width: 25 }} />
                    </div>
                </div>
            </motion.footer>
        </div>
    );
}