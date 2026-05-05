"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { ArrowLeft, Package, Truck, MessageSquare, ShieldCheck, X, QrCode, Banknote, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Font Configuration ---
const fontJudul = localFont({
    src: "../../fonts/8 Heavy.ttf",
    variable: "--font-brand",
    display: "swap",
});

// Font untuk caption
const fontCaption = localFont({
    src: "../../fonts/Nohemi-Regular.otf",
    variable: "--font-body",
    display: "swap",
});

// Component utama
export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);

    // State untuk Modal & QRIS
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris" | null>(null);
    const [qrisData, setQrisData] = useState<any>(null);

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // useEffect Fungsi Pertama
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.push("/login");
            return;
        }

        // Fungsi untuk mengambil detail order
        const fetchOrderDetail = async () => {
            try {
                const response = await fetch(`https://ramadhan.alwaysdata.net/api/orders/${params.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                const result = await response.json();
                if (result.status === "success") {
                    setOrder(result.data);
                }
            } catch (error) {
                console.error("Error fetching order detail:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchOrderDetail();  // Memanggil fungsi untuk mengambil detail order
    }, [params.id, router]);

    // useEffect Fungsi ke 2, Modifikasi useEffect polling status
    useEffect(() => {
        let interval: NodeJS.Timeout;

        // Polling HANYA aktif jika loading utama sudah selesai, QRIS sudah muncul, dan modal terbuka
        if (!loading && qrisData && isModalOpen) {
            interval = setInterval(async () => {
                try {
                    const orderId = qrisData.order_id;

                    // Gunakan backend Anda sebagai proxy untuk menghindari CORS
                    const response = await fetch(`https://ramadhan.alwaysdata.net/api/midtrans/status/${orderId}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
                            'Accept': 'application/json'
                        }
                    });

                    const result = await response.json();

                    // Cek status dari response Midtrans yang diteruskan backend
                    if (result.transaction_status === 'settlement' || result.transaction_status === 'capture') {
                        setOrder((prev: any) => ({ ...prev, status_pembayaran: "success" }));

                        await updatePaymentStatusToSuccess();   // Memanggil fungsi untuk update status pembayaran
                        setIsModalOpen(false);  // Menutup modal
                        setIsSuccessModalOpen(true);    // Menampilkan modal success
                        clearInterval(interval);    // Menghentikan polling
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                }
            }, 3000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [loading, qrisData, isModalOpen]);

    // Fungsi helper untuk update backend
    const updatePaymentStatusToSuccess = async () => {
        const token = localStorage.getItem("access_token");
        await fetch(`https://ramadhan.alwaysdata.net/api/orders/${params.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status_pembayaran: "success" }),
        });
        setOrder((prev: any) => ({ ...prev, status_pembayaran: "success" }));
    };

    // FUNGSI PEMBAYARAN CASH (Update Status ke Backend)
    const handleCashPayment = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        setIsPaying(true);
        try {
            const response = await fetch(`https://ramadhan.alwaysdata.net/api/orders/${params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: JSON.stringify({ status_pembayaran: "success" }),
            });

            const result = await response.json();
            if (result.success || result.status === "success") {
                setOrder((prevOrder: any) => ({ ...prevOrder, status_pembayaran: "success" }));
                setIsModalOpen(false);
                alert("Pembayaran Cash Berhasil Terverifikasi!");
            } else {
                alert("Gagal memproses pembayaran: " + (result.message || "Unknown error"));
            }
        } catch (error) {
            alert("Terjadi kesalahan pada server.");
        } finally {
            setIsPaying(false);
        }
    };

    // FUNGSI TEMBAK API MIDTRANS QRIS
    // Ubah bagian fetch di dalam handleQrisPayment
    const handleQrisPayment = async () => {
        setIsPaying(true);
        setPaymentMethod("qris");

        // 1. Hitung ulang total berdasarkan item agar PASTI SAMA
        const items = order.details.map((item: { product: { id: any; nama: string; }; harga_saat_beli: any; jumlah: any; }) => ({
            id: String(item.product.id).substring(0, 50),
            price: Math.round(Number(item.harga_saat_beli)),
            quantity: Number(item.jumlah),
            name: item.product.nama.substring(0, 50)
        }));

        // 2. Hitung total dari item (price * quantity)
        const itemsTotal = items.reduce((sum: number, item: { price: number; quantity: number; }) => sum + (item.price * item.quantity), 0);

        // 3. Tambahkan ongkir (asumsikan ongkir adalah komponen tambahan)
        const shippingCost = Math.round(Number(order.ongkos_kirim));
        const grossAmount = itemsTotal + shippingCost;

        try {
            const response = await fetch('/api/midtrans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_type: "qris",
                    transaction_details: {
                        order_id: `EVOMI-${order.id}-${Date.now()}`,
                        gross_amount: grossAmount // Harus sama dengan total di bawah
                    },
                    item_details: [
                        ...items,
                        {
                            id: "ONGKIR",
                            price: shippingCost,
                            quantity: 1,
                            name: "Ongkos Kirim"
                        }
                    ],
                    customer_details: {
                        first_name: "Customer",
                        last_name: "Evomi",
                        email: "customer@example.com",
                    },
                    qris: { acquirer: "gopay" }
                })
            });

            // ... sisa logic penanganan response tetap sama
            // Cek jika ada error validation dari Midtrans
            const result = await response.json();

            // Cek jika ada error validation dari Midtrans
            if (result.status_code === "201") {
                setQrisData(result);
            } else if (result.validation_messages) {
                // Ini akan memunculkan pesan error spesifik dari Midtrans
                alert(`Validation Error: ${result.validation_messages.join(", ")}`);
            } else {
                alert(`Gagal: ${result.status_message || "Terjadi kesalahan sistem"}`);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsPaying(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9] text-stone-400 text-[10px] uppercase tracking-[0.3em] animate-pulse">
            Retrieving Order Details...
        </div>
    );

    if (!order) return null;

    return (
        <div className={`${fontCaption.variable} ${fontJudul.variable} min-h-screen bg-[#FBFBF9] font-sans antialiased text-stone-900 selection:bg-amber-100`}>

            {/* MODAL SUKSES */}
            <AnimatePresence>
                {isSuccessModalOpen && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="bg-white p-10 rounded-[2.5rem] text-center max-w-sm w-full relative z-10"
                        >
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={40} className="text-emerald-600" />
                            </div>
                            <h3 className={`${fontJudul.className} text-2xl uppercase mb-2`}>Payment Confirmed</h3>
                            <p className="text-stone-400 text-sm mb-8">Terima kasih, pembayaran pesanan Anda telah berhasil diverifikasi.</p>
                            <button
                                onClick={() => setIsSuccessModalOpen(false)}
                                className="w-full py-4 bg-stone-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest"
                            >
                                Close
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- MODAL PEMBAYARAN --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => { if (!isPaying) setIsModalOpen(false); }}
                            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
                        >
                            <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                                <h3 className={`${fontJudul.className} text-xl uppercase tracking-tighter`}>Select Method</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-4">
                                {!qrisData ? (
                                    <>
                                        {/* Opsi Cash */}
                                        <button
                                            onClick={handleCashPayment}
                                            disabled={isPaying}
                                            className="w-full flex items-center p-6 rounded-3xl border border-stone-100 hover:border-amber-200 hover:bg-amber-50 transition-all group"
                                        >
                                            <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white mr-4">
                                                <Banknote size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Pay via</p>
                                                <p className={`${fontJudul.className} text-lg uppercase`}>Cash on Delivery</p>
                                            </div>
                                        </button>

                                        {/* Opsi QRIS */}
                                        <button
                                            onClick={handleQrisPayment}
                                            disabled={isPaying}
                                            className="w-full flex items-center p-6 rounded-3xl border border-stone-100 hover:border-amber-200 hover:bg-amber-50 transition-all group"
                                        >
                                            <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white mr-4">
                                                {isPaying && paymentMethod === 'qris' ? <Loader2 className="animate-spin" size={20} /> : <QrCode size={20} />}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Pay via</p>
                                                <p className={`${fontJudul.className} text-lg uppercase`}>QRIS / E-Wallet</p>
                                            </div>
                                        </button>
                                    </>
                                ) : (
                                    /* Tampilan QR Code Setelah di-Generate */
                                    <div className="flex flex-col items-center text-center py-4">
                                        <div className="bg-stone-50 p-6 rounded-[2rem] border border-stone-100 mb-6">
                                            {/* Midtrans memberikan URL image QRIS di actions[0].url */}
                                            <img
                                                src={qrisData.actions?.[0]?.url}
                                                alt="QRIS Code"
                                                className="w-64 h-64 object-contain"
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Scan with your preferred app</p>
                                        <h4 className={`${fontJudul.className} text-2xl text-stone-900`}>Rp {(Number(order.total_harga) + Number(order.ongkos_kirim)).toLocaleString("id-ID")}</h4>
                                        <button
                                            onClick={() => { setQrisData(null); setIsModalOpen(false); }}
                                            className="mt-8 text-[10px] font-bold uppercase tracking-widest text-stone-400 underline underline-offset-4"
                                        >
                                            Back to details
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* NAVBAR - Updated to Evomi Blue */}
            <nav className="fixed w-full z-[100] bg-[#0071bc]/90 backdrop-blur-xl border-b border-white/5 h-20 flex items-center px-8">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <Link href="/orders" className="flex items-center space-x-3 text-white/60 hover:text-white transition-all group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">History</span>
                    </Link>
                    <div className={`${fontJudul.className} text-xl tracking-[0.2em] uppercase text-white`}>Evomi</div>
                    <div className="w-10" />
                </div>
            </nav>

            <main className="pt-40 pb-20 px-6 max-w-7xl mx-auto">

                {/* HEADER INFO */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-[1px] bg-stone-300"></div>
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.4em]">Transaction Record</p>
                        </div>
                        <h1 className={`${fontJudul.className} text-4xl md:text-6xl text-stone-900 uppercase tracking-tighter leading-none`}>
                            #{order.id} <span className="text-stone-300 italic font-light">Details</span>
                        </h1>
                    </motion.div>

                    <div className={`px-6 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm
                        ${order.status_pembayaran === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        {order.status_pembayaran === 'success' ? 'Payment Verified' : 'Awaiting Payment'}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* LEFT CONTENT: ITEMS & SHIPPING */}
                    <div className="lg:col-span-8 space-y-8">
                        <section className="bg-white rounded-[2.5rem] border border-stone-100 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                            <div className="p-8 border-b border-stone-50 bg-stone-50/30 flex justify-between items-center">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Curated Selection</h3>
                                <span className="text-[10px] text-stone-300 font-bold uppercase">{order.details?.length} Essence(s)</span>
                            </div>

                            <div className="divide-y divide-stone-50">
                                {order.details?.map((item: any) => (
                                    <div key={item.id} className="p-8 flex items-center space-x-8 group">
                                        <div className="w-20 h-24 bg-stone-50 rounded-2xl overflow-hidden relative shrink-0 border border-stone-100 group-hover:border-stone-200 transition-colors">
                                            <Image
                                                src={item.product?.image_url || "/img/placeholder.png"}
                                                alt={item.product?.nama}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mb-1">SKU: {item.product?.id}</p>
                                            <h4 className={`${fontJudul.className} text-xl text-stone-800 uppercase`}>{item.product?.nama}</h4>
                                            <p className="text-[11px] text-stone-400 font-medium mt-1 uppercase tracking-wider">
                                                {item.jumlah} Unit • Rp {Number(item.harga_saat_beli).toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`${fontJudul.className} text-stone-900 text-lg`}>
                                                Rp {(item.jumlah * Number(item.harga_saat_beli)).toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-[2.5rem] p-10 border border-stone-100 shadow-sm space-y-6">
                                <div className="flex items-center space-x-3">
                                    <Truck size={16} className="text-stone-300" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Delivery Address</h3>
                                </div>
                                <p className="text-sm text-stone-600 font-light leading-relaxed italic">"{order.alamat_pengiriman}"</p>
                                <div className="pt-4">
                                    <span className="text-[9px] bg-stone-900 text-white px-3 py-1.5 rounded-full uppercase font-bold tracking-widest">{order.kurir}</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] p-10 border border-stone-100 shadow-sm flex flex-col justify-between space-y-6">
                                <div>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <MessageSquare size={16} className="text-stone-300" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Artisan Notes</h3>
                                    </div>
                                    <p className="text-xs text-stone-400 italic leading-relaxed">
                                        {order.catatan_pengiriman || "No specific instructions provided for this fragrance shipment."}
                                    </p>
                                </div>
                                <div className="pt-6 border-t border-stone-50 flex items-center justify-between">
                                    <span className="text-[9px] text-stone-300 uppercase font-black tracking-widest">System Record</span>
                                    <span className="text-[9px] text-stone-400 font-mono">UID-{order.id}</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT CONTENT: SUMMARY STICKY */}
                    <div className="lg:col-span-4">
                        <div className="bg-stone-900 rounded-[2.5rem] p-10 text-white sticky top-32 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
                            <h3 className={`${fontJudul.className} text-2xl uppercase tracking-widest mb-10 border-b border-white/5 pb-6`}>Investment</h3>

                            <div className="space-y-6 mb-12">
                                <div className="flex justify-between text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">
                                    <span>Subtotal</span>
                                    <span className="text-white">Rp {Number(order.total_harga).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">
                                    <span>Shipping Fee</span>
                                    <span className="text-white">Rp {Number(order.ongkos_kirim).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="h-[1px] bg-white/5 my-2"></div>
                                <div className="flex flex-col space-y-2">
                                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-[0.3em]">Total Amount</span>
                                    <span className={`${fontJudul.className} text-4xl text-amber-200`}>
                                        Rp {(Number(order.total_harga) + Number(order.ongkos_kirim)).toLocaleString("id-ID")}
                                    </span>
                                </div>
                            </div>

                            {order.status_pembayaran === 'pending' ? (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 shadow-xl bg-white text-stone-900 hover:bg-amber-100 hover:-translate-y-1"
                                >
                                    Authorize Payment
                                </button>
                            ) : (
                                <div className="w-full bg-white/5 border border-white/10 py-5 rounded-2xl flex items-center justify-center space-x-3">
                                    <ShieldCheck size={16} className="text-emerald-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Fulfilled</span>
                                </div>
                            )}

                            <p className="mt-10 text-[9px] text-white/20 text-center leading-relaxed font-light uppercase tracking-widest">
                                Thank you for choosing Evomi.<br />The essence of presence.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}