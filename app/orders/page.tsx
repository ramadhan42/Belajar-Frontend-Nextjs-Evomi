"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { ChevronRight, Package, Calendar, Tag, ChevronLeft } from "lucide-react";
import WavyNavbarGradient from "@/components/WavyNavbarGradient";

// String global url
import { BASE_URL } from "@/src/config/strings";

// container variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15 
        }
    }
};

// item variants
const itemVariants = { 
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
    }
};

// --- Font Configuration ---
const fontJudul = localFont({
    src: "../fonts/8 Heavy.ttf",
    variable: "--font-brand",
    display: "swap",
});

// local fonts
const fontCaption = localFont({ 
    src: "../fonts/Nohemi-Regular.otf",
    variable: "--font-body",
    display: "swap",
});

export default function OrderHistoryPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const savedUser = localStorage.getItem("user_data");

        if (!token || !savedUser) {
            router.push("/login");
            return;
        }

        setUser(JSON.parse(savedUser));

        const fetchOrders = async () => {
            try {
                const response = await fetch(BASE_URL + "/api/orders", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                const result = await response.json();
                // Urutkan order terbaru di atas (opsional, jika API belum mengurutkan)
                const fetchedOrders = result.data || result;
                setOrders(fetchedOrders);
            } catch (error) {
                console.error("Gagal mengambil riwayat pesanan:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    useEffect(() => {
        if (!user) return;

        const setOnlineStatus = async () => {
            try {
                await fetch(`${BASE_URL}/api/user/status`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                    },
                    body: JSON.stringify({ is_online: 1 })
                });
            } catch (err) {
                console.error("Gagal update status online:", err);
            }
        };

        setOnlineStatus();

        const handleOfflineBeacon = () => {
            const url = `${BASE_URL}/api/user/status-beacon`;
            const data = JSON.stringify({
                user_id: user.id,
                is_online: 0
            });
            const blob = new Blob([data], { type: 'application/json' });
            navigator.sendBeacon(url, blob);
        };

        window.addEventListener('beforeunload', handleOfflineBeacon);

        return () => {
            handleOfflineBeacon();
            window.removeEventListener('beforeunload', handleOfflineBeacon);
        };
    }, [user]);

    // Handle Logout
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("access_token");
            await fetch(`${BASE_URL}/api/user/status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ is_online: 0 })
            });
        } catch (err) {
            console.error("Logout status error:", err);
        } finally {
            localStorage.removeItem("access_token");
            localStorage.removeItem("user_data");
            setUser(null);
            router.push("/");
        }
    };

    // Get Status Style
    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case "success": return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "pending": return "bg-amber-50 text-amber-700 border-amber-100";
            case "failed": case "expired": return "bg-rose-50 text-rose-700 border-rose-100";
            default: return "bg-stone-50 text-stone-500 border-stone-100";
        }
    };

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentOrders = orders.slice(startIndex, startIndex + itemsPerPage);

    // Fungsi untuk navigasi halaman
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll ke atas saat ganti page
        }
    };

    // Handle Prev Page
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className={`${fontCaption.variable} ${fontJudul.variable} min-h-screen bg-[#FBFBF9] font-sans antialiased text-stone-900 selection:bg-amber-100`}>

            {/* NAVBAR */}
            <nav className="fixed w-full z-[100] bg-[#0071bc]/90 backdrop-blur-xl border-b border-white/10 shadow-sm">
                <WavyNavbarGradient />
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="hover:opacity-70 transition-opacity">
                        <Image
                            src="/img/Logo Evomi.png"
                            alt="Evomi"
                            width={80}
                            height={32}
                            className="brightness-0 invert"
                        />
                    </Link>

                    <div className="relative">
                        {user && (
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center space-x-3 border border-white/20 rounded-full p-1 pr-4 hover:bg-white/10 transition-all text-white"
                            >
                                <div className="w-8 h-8 rounded-full bg-white text-[#0071bc] flex items-center justify-center text-[10px] font-black uppercase">
                                    {user.name.charAt(0)}
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-widest">{user.username}</span>
                            </button>
                        )}

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-[1.5rem] shadow-2xl border border-stone-100 py-3 z-50 overflow-hidden">
                                <Link href="/profile" className="block px-6 py-3 text-[11px] uppercase tracking-widest font-bold text-stone-600 hover:bg-stone-50 transition-colors">Profile</Link>
                                <div className="h-[1px] bg-stone-50 mx-4 my-1"></div>
                                <button onClick={handleLogout} className="w-full text-left px-6 py-3 text-[11px] uppercase tracking-widest font-bold text-rose-500 hover:bg-rose-50 transition-colors">Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* AMBIENT BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-40 left-[-10%] w-[40rem] h-[40rem] bg-stone-200/40 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-10 right-[-5%] w-[30rem] h-[30rem] bg-amber-100/30 rounded-full blur-[100px]"></div>
            </div>

            {/* MAIN CONTENT */}
            <main className="pt-40 pb-24 px-6 max-w-5xl mx-auto">
                <header className="mb-16">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-10 h-[1px] bg-stone-300"></div>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold">Archives</span>
                    </div>
                    <h1 className={`${fontJudul.className} text-5xl md:text-6xl text-stone-900 uppercase tracking-tighter leading-none`}>
                        Order <span className="italic font-light text-stone-300">History</span>
                    </h1>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="w-12 h-12 border-[3px] border-stone-100 border-t-stone-900 rounded-full animate-spin"></div>
                        <p className="text-stone-400 text-[10px] tracking-[0.3em] uppercase font-bold">Retreiving Archives...</p>
                    </div>
                ) : orders.length > 0 ? (
                    <>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            className="space-y-8"
                        >
                            {/* Ubah orders.map menjadi currentOrders.map */}
                            {currentOrders.map((order, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={order.id}
                                    className="bg-white border border-stone-100 rounded-[2.5rem] overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)] transition-all duration-700 group"
                                >
                                    <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div className="flex items-start space-x-8">
                                            <div className="w-24 h-28 bg-stone-50 rounded-2xl flex-shrink-0 relative overflow-hidden border border-stone-100 group-hover:border-stone-200 transition-colors">
                                                <div className="absolute inset-0 flex items-center justify-center text-stone-200 group-hover:text-stone-300 transition-colors">
                                                    <Package size={32} strokeWidth={1} />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-3">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status_pembayaran)}`}>
                                                        {order.status_pembayaran}
                                                    </span>
                                                    <span className="text-[10px] text-stone-300 font-medium tracking-widest uppercase">#{order.order_number || order.id}</span>
                                                </div>

                                                <h3 className={`${fontJudul.className} text-2xl text-stone-800 uppercase leading-tight group-hover:text-amber-900 transition-colors`}>
                                                    {order.items?.[0]?.product_name || "Artisan Fragrance"}
                                                    {order.items?.length > 1 && <span className="text-xs normal-case font-body font-light text-stone-400 ml-3 italic">+{order.items.length - 1} other scents</span>}
                                                </h3>

                                                <div className="flex items-center space-x-4 text-[11px] text-stone-400 font-medium">
                                                    <div className="flex items-center space-x-1.5">
                                                        <Calendar size={12} className="text-stone-300" />
                                                        <span>{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-6 border-t md:border-t-0 pt-6 md:pt-0 border-stone-50">
                                            <div className="md:text-right">
                                                <p className="text-[9px] text-stone-400 uppercase tracking-[0.2em] font-black mb-1">Investment</p>
                                                <p className={`${fontJudul.className} text-xl text-stone-900`}>Rp {Number(order.total_harga).toLocaleString("id-ID")}</p>
                                            </div>

                                            <Link
                                                href={`/orders/${order.id}`}
                                                className="h-12 w-12 md:w-auto md:px-6 bg-stone-50 md:bg-stone-900 md:text-white rounded-full flex items-center justify-center gap-2 hover:bg-amber-900 transition-all group/btn"
                                            >
                                                <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest">View Details</span>
                                                <ChevronRight size={16} className="md:group-hover/btn:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* PAGINATION CONTROLS */}
                        {totalPages > 1 && (
                            <div className="mt-16 flex items-center justify-center space-x-6">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className="h-12 w-12 flex items-center justify-center rounded-full border border-stone-200 text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-50 transition-all"
                                    aria-label="Previous Page"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                                    Page <span className="text-stone-900">{currentPage}</span> of {totalPages}
                                </span>

                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="h-12 w-12 flex items-center justify-center rounded-full bg-stone-900 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-900 transition-all shadow-md"
                                    aria-label="Next Page"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-stone-200">
                        <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Tag size={32} className="text-stone-200" strokeWidth={1} />
                        </div>
                        <h3 className={`${fontJudul.className} text-2xl text-stone-800 uppercase tracking-tight`}>Empty Archives</h3>
                        <p className="text-stone-400 font-light mt-3 mb-10 max-w-xs mx-auto text-sm italic leading-relaxed">
                            Sepertinya Anda belum memulai perjalanan aroma bersama Evomi.
                        </p>
                        <Link href="/produk" className="inline-block bg-stone-900 text-white px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-amber-900 transition-all shadow-xl shadow-stone-100">
                            Explore Collections
                        </Link>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="py-12 text-center">
                <p className="text-[9px] text-stone-300 uppercase tracking-[0.4em] font-bold">Evomi Fragrance House • Jakarta</p>
            </footer>
        </div>
    );
}