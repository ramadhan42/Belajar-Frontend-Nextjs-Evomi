"use client";

// React & Next
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { SocialIcon } from 'react-social-icons';
import { motion, Variants, AnimatePresence } from "framer-motion";

// Komponen Modal & Config
import QuizModal from "@/components/QuizModal";
import ChatModal from "@/components/ChatModal";
import { BASE_URL } from "@/src/config/strings";

// --- Fonts ---
const fontJudul = localFont({
    src: "../../fonts/8 Heavy.ttf",
    variable: "--font-brand",
    display: "swap",
});

const fontCaption = localFont({
    src: "../../fonts/Nohemi-Regular.otf",
    variable: "--font-body",
    display: "swap",
});

// --- Animasi ---
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
    }
};

export default function ArtikelDetailPage() {
    const params = useParams();
    const router = useRouter();

    const [article, setArticle] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<{
        id: any; email: string; name: string; username: string; image: string; 
} | null>(null);
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);


    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


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

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("access_token");
        const savedUser = localStorage.getItem("user_data");
        if (token && savedUser) {
            try { setUser(JSON.parse(savedUser)); } catch (error) { console.error(error); }
        }
    }, []);

    useEffect(() => {
        const fetchArticleDetail = async () => {
            try {
                // Fetch menggunakan slug/ID dari URL
                const response = await fetch(`${BASE_URL}/api/articles/${params.id}`);
                const result = await response.json();
                if (result.success) {
                    setArticle(result.data);
                }
            } catch (error) {
                console.error("Gagal mengambil detail artikel:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) fetchArticleDetail();
    }, [params.id]);
    
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

    if (!mounted) return null;

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9]">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Loading Journal...</p>
        </div>
    );

    if (!article) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9]">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-400">Artikel Tidak Ditemukan</p>
        </div>
    );

    return (
        <div className={`${fontCaption.variable} ${fontJudul.variable} min-h-screen bg-[#FBFBF9] text-stone-900 font-sans antialiased selection:bg-amber-200 selection:text-stone-900`}>

            <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
            <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

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

            {/* DETAIL CONTENT */}
            <main className="pt-32 pb-20 px-6">
                <article className="max-w-4xl mx-auto">
                    <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center mb-10">
                        <span className="text-[9px] font-bold tracking-[0.3em] text-amber-800 uppercase bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100">
                            {article.slug}
                        </span>
                        <h1 className={`${fontJudul.className} text-4xl md:text-6xl uppercase mt-8 mb-6 leading-tight text-stone-800`}>
                            {article.title}
                        </h1>
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-stone-400 text-[10px] font-bold tracking-widest uppercase">
                                Published on {new Date(article.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                            <span className="text-[10px] text-amber-900/60 font-bold uppercase tracking-widest">By {article.author || 'Evomi Editorial'}</span>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="relative aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 shadow-xl border border-stone-100">
                        <Image
                            src={article.image_url || "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1200"}
                            alt={article.title}
                            fill
                            className="object-cover"
                        />
                    </motion.div>

                    {/* BAGIAN RENDER KONTEN RICH TEXT */}
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="max-w-3xl mx-auto">
                        <div
                            className="
                            article-content
                            prose prose-stone prose-lg
                            max-w-none

                            prose-headings:font-bold
                            prose-headings:text-stone-900
                            prose-headings:tracking-tight
                            prose-headings:scroll-mt-32

                            prose-h1:text-4xl
                            prose-h2:text-3xl
                            prose-h3:text-2xl

                            prose-p:text-stone-700
                            prose-p:leading-8
                            prose-p:mb-6
                            prose-p:text-justify

                            prose-strong:text-stone-900
                            prose-strong:font-semibold

                            prose-a:text-[#0071bc]
                            prose-a:no-underline
                            hover:prose-a:underline

                            prose-ul:list-disc
                            prose-ol:list-decimal
                            prose-li:marker:text-stone-500
                            prose-li:text-stone-700
                            prose-li:leading-8

                            prose-blockquote:border-l-4
                            prose-blockquote:border-[#0071bc]
                            prose-blockquote:bg-stone-50
                            prose-blockquote:px-6
                            prose-blockquote:py-3
                            prose-blockquote:rounded-r-2xl
                            prose-blockquote:text-stone-700

                            prose-img:rounded-3xl
                            prose-img:shadow-xl
                            prose-img:my-10

                            prose-code:text-pink-600
                            prose-pre:bg-stone-900
                            prose-pre:text-stone-100

                            break-words
                            overflow-hidden
                            "
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                    </motion.div>
                </article>
            </main>

            {/* Tombol Back & Footer */}
            <footer className="bg-white pt-20 pb-10 px-6 border-t border-stone-100 mt-20">
                <div className="max-w-7xl mx-auto flex flex-col items-center">
                    <Link
                        href="/artikel"
                        className="group flex items-center space-x-4 border border-stone-200 px-10 py-4 rounded-full hover:bg-stone-900 hover:border-stone-900 transition-all duration-500 mb-12"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400 group-hover:text-white transition-colors duration-500">
                            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={`${fontJudul.className} text-[11px] tracking-[0.3em] uppercase text-stone-800 group-hover:text-white transition-colors duration-500`}>
                            Back to Articles
                        </span>
                    </Link>
                    <div className="text-[10px] text-stone-400 uppercase tracking-[0.2em] pt-8 border-t w-full text-center">
                        &copy; {new Date().getFullYear()} EVOMI FRAGRANCE HOUSE
                    </div>
                </div>
            </footer>
        </div>
    );
}