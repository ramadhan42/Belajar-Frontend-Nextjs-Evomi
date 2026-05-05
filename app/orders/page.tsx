"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, Package, Calendar, Tag } from "lucide-react";

// Variants untuk animasi kontainer[cite: 6]
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
    }
};

// --- Font Configuration[cite: 6] ---
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

export default function OrderHistoryPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                const response = await fetch("https://ramadhan.alwaysdata.net/api/orders", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                const result = await response.json();
                setOrders(result.data || result);
            } catch (error) {
                console.error("Gagal mengambil riwayat pesanan:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_data");
        router.push("/");
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case "success": return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "pending": return "bg-amber-50 text-amber-700 border-amber-100";
            case "failed": case "expired": return "bg-rose-50 text-rose-700 border-rose-100";
            default: return "bg-white/10 text-white/60 border-white/10";
        }
    };

    return (
        <div className={`${fontCaption.variable} ${fontJudul.variable} min-h-screen bg-[#0071bc] font-sans antialiased text-white selection:bg-white/20`}>

            {/* NAVBAR - Penyesuaian tema biru[cite: 6] */}
            <nav className="fixed w-full z-[100] bg-[#0071bc]/90 backdrop-blur-xl border-b border-white/10 shadow-sm">
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
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-[1.5rem] shadow-2xl border border-blue-100 py-3 z-50 overflow-hidden text-[#0071bc]">
                                <Link href="/profile" className="block px-6 py-3 text-[11px] uppercase tracking-widest font-bold hover:bg-blue-50 transition-colors">Profile</Link>
                                <div className="h-[1px] bg-blue-50 mx-4 my-1"></div>
                                <button onClick={handleLogout} className="w-full text-left px-6 py-3 text-[11px] uppercase tracking-widest font-bold text-rose-500 hover:bg-rose-50 transition-colors">Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* AMBIENT BACKGROUND - Disesuaikan agar menyatu dengan biru[cite: 6] */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-40 left-[-10%] w-[40rem] h-[40rem] bg-white/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-10 right-[-5%] w-[30rem] h-[30rem] bg-blue-400/20 rounded-full blur-[100px]"></div>
            </div>

            <main className="pt-40 pb-24 px-6 max-w-5xl mx-auto">
                {/* HEADER[cite: 6] */}
                <header className="mb-16">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-10 h-[1px] bg-white/30"></div>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-bold">Archives</span>
                    </div>
                    <h1 className={`${fontJudul.className} text-5xl md:text-6xl text-white uppercase tracking-tighter leading-none`}>
                        Order <span className="italic font-light text-white/40">History</span>
                    </h1>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="w-12 h-12 border-[3px] border-white/10 border-t-white rounded-full animate-spin"></div>
                        <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-bold">Retreiving Archives...</p>
                    </div>
                ) : orders.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        className="space-y-8"
                    >
                        {orders.map((order, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={order.id}
                                className="bg-white border border-blue-100 rounded-[2.5rem] overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-700 group"
                            >
                                <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">

                                    {/* Info Utama[cite: 6] */}
                                    <div className="flex items-start space-x-8">
                                        <div className="w-24 h-28 bg-blue-50 rounded-2xl flex-shrink-0 relative overflow-hidden border border-blue-100 group-hover:border-blue-200 transition-colors">
                                            <div className="absolute inset-0 flex items-center justify-center text-[#0071bc]/20 group-hover:text-[#0071bc]/40 transition-colors">
                                                <Package size={32} strokeWidth={1} />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status_pembayaran)}`}>
                                                    {order.status_pembayaran}
                                                </span>
                                                <span className="text-[10px] text-slate-300 font-medium tracking-widest uppercase">#{order.order_number || order.id}</span>
                                            </div>

                                            <h3 className={`${fontJudul.className} text-2xl text-[#0071bc] uppercase leading-tight group-hover:text-blue-800 transition-colors`}>
                                                {order.items?.[0]?.product_name || "Artisan Fragrance"}
                                                {order.items?.length > 1 && <span className="text-xs normal-case font-body font-light text-slate-400 ml-3 italic">+{order.items.length - 1} other scents</span>}
                                            </h3>

                                            <div className="flex items-center space-x-4 text-[11px] text-slate-400 font-medium">
                                                <div className="flex items-center space-x-1.5">
                                                    <Calendar size={12} className="text-slate-300" />
                                                    <span>{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Harga & Detail Link[cite: 6] */}
                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-6 border-t md:border-t-0 pt-6 md:pt-0 border-blue-50">
                                        <div className="md:text-right">
                                            <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-black mb-1">Investment</p>
                                            <p className={`${fontJudul.className} text-xl text-[#0071bc]`}>Rp {Number(order.total_harga).toLocaleString("id-ID")}</p>
                                        </div>

                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="h-12 w-12 md:w-auto md:px-6 bg-blue-50 md:bg-[#0071bc] md:text-white text-[#0071bc] rounded-full flex items-center justify-center gap-2 hover:bg-blue-800 hover:text-white transition-all group/btn"
                                        >
                                            <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest">View Details</span>
                                            <ChevronRight size={16} className="md:group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    /* EMPTY STATE[cite: 6] */
                    <div className="text-center py-24 bg-white/5 rounded-[3rem] border border-dashed border-white/20">
                        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Tag size={32} className="text-white/20" strokeWidth={1} />
                        </div>
                        <h3 className={`${fontJudul.className} text-2xl text-white uppercase tracking-tight`}>Empty Archives</h3>
                        <p className="text-white/60 font-light mt-3 mb-10 max-w-xs mx-auto text-sm italic leading-relaxed">
                            Sepertinya Anda belum memulai perjalanan aroma bersama Evomi.
                        </p>
                        <Link href="/produk" className="inline-block bg-white text-[#0071bc] px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20">
                            Explore Collections
                        </Link>
                    </div>
                )}
            </main>

            <footer className="py-12 text-center">
                <p className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-bold">Evomi Fragrance House • Jakarta</p>
            </footer>
        </div>
    );
}