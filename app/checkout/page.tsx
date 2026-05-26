"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import localFont from "next/font/local";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import WavyNavbarGradient from "@/components/WavyNavbarGradient";

// String global url
import { BASE_URL, HARGA_ONGKIR } from "@/src/config/strings";

// --- Animasi Variants ---
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }
    }
};

// stagger container
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

// --- Font Configuration ---
const fontJudul = localFont({
    src: "../fonts/8 Heavy.ttf",
    variable: "--font-brand",
    display: "swap",
});

// Font untuk caption
const fontCaption = localFont({
    src: "../fonts/Nohemi-Regular.otf",
    variable: "--font-body",
    display: "swap",
});

// Interface untuk item keranjang
interface CartItem {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image_url: string;
    image: string;
}

// Interface untuk profil user
interface UserProfile {
    id: any;
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

// Component utama
export default function CheckoutPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shippingAddress, setShippingAddress] = useState("");
    const [catatan, setCatatan] = useState("");
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    // 2. LOGIKA STATUS: Online / Offline (Beacon API)
    useEffect(() => {
        if (!user || !user.id) return;

        // Fungsi Set ONLINE
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

        // Fungsi Beacon untuk Set OFFLINE (Saat tab ditutup)
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
            // Jalankan saat pindah halaman
            handleOfflineBeacon();
            window.removeEventListener('beforeunload', handleOfflineBeacon);
        };
    }, [user]);

    // Fungsi untuk mengambil data
    const fetchData = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            setError("Silakan login terlebih dahulu.");
            setLoading(false);
            return;
        }

        try {
            const cartRes = await fetch(BASE_URL + `/api/cart`, {
                headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
            });
            const userRes = await fetch(BASE_URL + `/api/user`, {
                headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
            });

            if (cartRes.ok && userRes.ok) {
                const cartData = await cartRes.json();
                const userData = await userRes.json();
                setCartItems(cartData.cart || []);
                const profile = userData.user || userData;
                setUser(profile);
                if (profile.address) setShippingAddress(profile.address);
            } else {
                setError("Gagal memuat data checkout.");
            }
        } catch (err) {
            setError("Terjadi kesalahan koneksi.");
        } finally {
            setLoading(false);
        }
    };

    // Effect untuk mengambil data saat component dimount
    useEffect(() => {
        fetchData();
    }, []);

    // handle checkout ada ongkos kirim
    const handleCheckout = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return alert("Silakan login terlebih dahulu");
        if (!shippingAddress) return alert("Mohon isi alamat pengiriman");

        // Set state untuk menampilkan loading
        setIsSubmitting(true);
        const orderData = {
            total_harga: subtotal + HARGA_ONGKIR,
            ongkos_kirim: HARGA_ONGKIR,
            alamat_pengiriman: shippingAddress,
            catatan_pengiriman: catatan,
            kurir: "Reguler (COD)",
            items: cartItems.map(item => ({ product_id: item.product_id, jumlah: item.quantity }))
        };

        try {
            const response = await fetch(BASE_URL + `/api/orders/checkout`, { // Endpoint untuk checkout
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();
            if (response.ok && result.success) {
                setOrderId(result.order_id || result.data?.id);
                setShowSuccessModal(true);
            } else {
                alert(result.message || "Gagal membuat pesanan");
            }
        } catch (err) {
            alert("Terjadi kesalahan koneksi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = HARGA_ONGKIR;
    const total = subtotal + shipping;

    // loading
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9] text-stone-400 text-[10px] uppercase tracking-[0.3em] animate-pulse">
            Finalizing Essence...
        </div>
    );

    return (
        <div className={`${fontJudul.variable} ${fontCaption.variable} font-body min-h-screen bg-[#FBFBF9] text-stone-900 selection:bg-amber-100`}>

            {/* SUCCESS MODAL */}
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-stone-900/20 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl border border-stone-100 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                                className="w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"
                            >
                                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </motion.div>
                            <h2 className={`${fontJudul.className} text-3xl uppercase tracking-tighter mb-3`}>Order Secured</h2>
                            <p className="text-stone-500 text-xs mb-10 font-light leading-relaxed">
                                Pesanan <span className="font-bold text-stone-800">#{orderId || "EV-99"}</span> sedang diproses.
                            </p>
                            <button onClick={() => window.location.href = '/profile'} className="w-full bg-stone-900 text-white py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-stone-800 transition-all shadow-lg">
                                Back to Collection
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Navbar checkout */}
            <nav className="fixed w-full z-[100] bg-[#0071bc] backdrop-blur-xl border-b border-white/5 h-20 flex items-center justify-between px-8">

                {/* BARU: Memanggil Komponen Wavy Curve */}
                <WavyNavbarGradient />

                {/* Arrow back to profile */}
                <Link href="/profile" className="text-white/60 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                
                <div className={`${fontJudul.className} text-xl tracking-[0.2em] uppercase text-white`}>Evomi</div>
                <div className="w-5" />
            </nav>

            {/* Main content */}
            <motion.main
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="pt-40 pb-20 px-6 max-w-7xl mx-auto"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                    {/* LEFT: SHIPPING FORM */}
                    <div className="lg:col-span-7 space-y-12">
                        <section>
                            <div className="flex items-center space-x-3 mb-10">
                                <div className="w-8 h-[1px] bg-stone-300"></div>
                                <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400">Checkout Identity</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                <div className="space-y-2">
                                    <label className="text-[8px] uppercase text-stone-400 font-bold tracking-widest ml-1">Full Name</label>
                                    <input type="text" readOnly defaultValue={user?.name || ''} className="w-full bg-white border border-stone-100 rounded-xl px-5 py-4 text-xs outline-none text-stone-500 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] uppercase text-stone-400 font-bold tracking-widest ml-1">Phone Number</label>
                                    <input type="text" defaultValue={user?.phone || ''} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-5 py-4 text-xs focus:ring-1 focus:ring-stone-200 outline-none transition-all" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[8px] uppercase text-stone-400 font-bold tracking-widest ml-1">Shipping Address</label>
                                    <textarea
                                        rows={3}
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Full address for delivery..."
                                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 text-xs focus:ring-1 focus:ring-stone-200 outline-none transition-all resize-none"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[8px] uppercase text-stone-400 font-bold tracking-widest ml-1">Notes (Optional)</label>
                                    <input
                                        type="text"
                                        value={catatan}
                                        onChange={(e) => setCatatan(e.target.value)}
                                        placeholder="Specific instructions..."
                                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-5 py-4 text-xs focus:ring-1 focus:ring-stone-200 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-start space-x-4">
                            <ShieldCheck size={20} className="text-amber-800 shrink-0" />
                            <p className="text-[10px] text-amber-900/70 leading-relaxed font-medium uppercase tracking-wider">
                                Payment via Cash on Delivery (COD). Please ensure the correct amount is ready upon arrival.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: ORDER SUMMARY - Glassmorphism Card */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-stone-100 sticky top-32">
                            <h3 className={`${fontJudul.className} text-xl uppercase tracking-widest text-stone-800 mb-8 border-b border-stone-50 pb-6`}>Summary</h3>

                            <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.product_id} className="flex gap-4 items-center">
                                        <div className="relative w-14 h-16 bg-stone-100 rounded-xl overflow-hidden border border-stone-50">
                                            <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-[10px] uppercase font-bold tracking-tight text-stone-800">{item.name}</h4>
                                            <p className="text-[9px] text-stone-400 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-[11px] font-medium text-stone-600">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-6 border-t border-stone-100 mb-10">
                                <div className="flex justify-between text-[10px] text-stone-400 uppercase tracking-[0.2em]">
                                    <span>Subtotal</span>
                                    <span className="text-stone-600">Rp {subtotal.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-stone-400 uppercase tracking-[0.2em]">
                                    <span>Shipping</span>
                                    <span className="text-stone-600">Rp {shipping.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between items-end pt-4">
                                    <span className={`${fontJudul.className} text-xs uppercase tracking-widest`}>Total Amount</span>
                                    <span className={`${fontJudul.className} text-xl text-stone-900`}>Rp {total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}  // Fungsi untuk menangani checkout
                                disabled={isSubmitting}
                                className={`w-full bg-stone-900 text-white py-5 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-stone-800 transition-all active:scale-[0.98] shadow-xl shadow-stone-100 group ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                                    {isSubmitting ? "Finalizing..." : "Complete Purchase"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.main>
        </div>
    );
}