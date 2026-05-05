"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { ArrowLeft, Package, Truck, MessageSquare, ShieldCheck, X, QrCode, Banknote, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Font Configuration[cite: 7] ---
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

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);

    // State untuk Modal & QRIS[cite: 7]
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris" | null>(null);
    const [qrisData, setQrisData] = useState<any>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.push("/login");
            return;
        }

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

        if (params.id) fetchOrderDetail();
    }, [params.id, router]);

    // Polling status pembayaran[cite: 7]
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!loading && qrisData && isModalOpen) {
            interval = setInterval(async () => {
                try {
                    const orderId = qrisData.order_id;
                    const response = await fetch(`https://ramadhan.alwaysdata.net/api/midtrans/status/${orderId}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
                            'Accept': 'application/json'
                        }
                    });
                    const result = await response.json();
                    if (result.transaction_status === 'settlement' || result.transaction_status === 'capture') {
                        setOrder((prev: any) => ({ ...prev, status_pembayaran: "success" }));
                        await updatePaymentStatusToSuccess();
                        setIsModalOpen(false);
                        setIsSuccessModalOpen(true);
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                }
            }, 3000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [loading, qrisData, isModalOpen]);

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
                setIsSuccessModalOpen(true);
            }
        } catch (error) {
            alert("Terjadi kesalahan pada server.");
        } finally {
            setIsPaying(false);
        }
    };

    const handleQrisPayment = async () => {
        setIsPaying(true);
        setPaymentMethod("qris");
        const items = order.details.map((item: any) => ({
            id: String(item.product.id).substring(0, 50),
            price: Math.round(Number(item.harga_saat_beli)),
            quantity: Number(item.jumlah),
            name: item.product.nama.substring(0, 50)
        }));
        const itemsTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
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
                        gross_amount: grossAmount
                    },
                    item_details: [...items, { id: "ONGKIR", price: shippingCost, quantity: 1, name: "Ongkos Kirim" }],
                    customer_details: { first_name: "Customer", last_name: "Evomi", email: "customer@example.com" },
                    qris: { acquirer: "gopay" }
                })
            });
            const result = await response.json();
            if (result.status_code === "201") {
                setQrisData(result);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsPaying(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0071bc] text-white text-[10px] uppercase tracking-[0.3em] animate-pulse">
            Retrieving Order Details...
        </div>
    );

    if (!order) return null;

    return (
        <div className={`${fontCaption.variable} ${fontJudul.variable} min-h-screen bg-[#0071bc] font-sans antialiased text-white selection:bg-white/20`}>

            {/* MODAL SUKSES[cite: 7] */}
            <AnimatePresence>
                {isSuccessModalOpen && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#002d4b]/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="bg-white p-10 rounded-[2.5rem] text-center max-w-sm w-full relative z-10"
                        >
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={40} className="text-[#0071bc]" />
                            </div>
                            <h3 className={`${fontJudul.className} text-2xl uppercase mb-2 text-[#0071bc]`}>Payment Confirmed</h3>
                            <p className="text-slate-400 text-sm mb-8">Terima kasih, pembayaran pesanan Anda telah berhasil diverifikasi.</p>
                            <button
                                onClick={() => setIsSuccessModalOpen(false)}
                                className="w-full py-4 bg-[#0071bc] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-100"
                            >
                                Close
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL PEMBAYARAN[cite: 7] */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => { if (!isPaying) setIsModalOpen(false); }}
                            className="absolute inset-0 bg-[#002d4b]/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
                        >
                            <div className="p-8 border-b border-blue-50 flex justify-between items-center">
                                <h3 className={`${fontJudul.className} text-xl uppercase tracking-tighter text-[#0071bc]`}>Select Method</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-[#0071bc] transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-4">
                                {!qrisData ? (
                                    <>
                                        <button
                                            onClick={handleCashPayment}
                                            disabled={isPaying}
                                            className="w-full flex items-center p-6 rounded-3xl border border-blue-50 hover:border-blue-100 hover:bg-blue-50 transition-all group"
                                        >
                                            <div className="w-12 h-12 bg-[#0071bc] rounded-2xl flex items-center justify-center text-white mr-4">
                                                <Banknote size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pay via</p>
                                                <p className={`${fontJudul.className} text-lg uppercase text-[#0071bc]`}>Cash on Delivery</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={handleQrisPayment}
                                            disabled={isPaying}
                                            className="w-full flex items-center p-6 rounded-3xl border border-blue-50 hover:border-blue-100 hover:bg-blue-50 transition-all group"
                                        >
                                            <div className="w-12 h-12 bg-[#0071bc] rounded-2xl flex items-center justify-center text-white mr-4">
                                                {isPaying && paymentMethod === 'qris' ? <Loader2 className="animate-spin" size={20} /> : <QrCode size={20} />}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pay via</p>
                                                <p className={`${fontJudul.className} text-lg uppercase text-[#0071bc]`}>QRIS / E-Wallet</p>
                                            </div>
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center text-center py-4">
                                        <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 mb-6">
                                            <img src={qrisData.actions?.[0]?.url} alt="QRIS Code" className="w-64 h-64 object-contain" />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Scan with your preferred app</p>
                                        <h4 className={`${fontJudul.className} text-2xl text-[#0071bc]`}>Rp {(Number(order.total_harga) + Number(order.ongkos_kirim)).toLocaleString("id-ID")}</h4>
                                        <button
                                            onClick={() => { setQrisData(null); setIsModalOpen(false); }}
                                            className="mt-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 underline underline-offset-4"
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

            {/* NAVBAR[cite: 7] */}
            <nav className="fixed w-full z-[100] bg-[#0071bc]/90 backdrop-blur-xl border-b border-white/10 h-20 flex items-center px-8">
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
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-[1px] bg-white/30"></div>
                            <p className="text-[10px] text-white/60 font-bold uppercase tracking-[0.4em]">Transaction Record</p>
                        </div>
                        <h1 className={`${fontJudul.className} text-4xl md:text-6xl text-white uppercase tracking-tighter leading-none`}>
                            #{order.id} <span className="text-white/40 italic font-light">Details</span>
                        </h1>
                    </motion.div>

                    <div className={`px-6 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm
                        ${order.status_pembayaran === 'success' ? 'bg-white/10 text-white border-white/20' : 'bg-white text-[#0071bc] border-white'}`}>
                        {order.status_pembayaran === 'success' ? 'Payment Verified' : 'Awaiting Payment'}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-8">
                        <section className="bg-white rounded-[2.5rem] border border-blue-50 overflow-hidden shadow-2xl shadow-blue-900/20">
                            <div className="p-8 border-b border-blue-50 bg-blue-50/30 flex justify-between items-center text-[#0071bc]">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-60">Curated Selection</h3>
                                <span className="text-[10px] font-bold uppercase">{order.details?.length} Essence(s)</span>
                            </div>

                            <div className="divide-y divide-blue-50">
                                {order.details?.map((item: any) => (
                                    <div key={item.id} className="p-8 flex items-center space-x-8 group">
                                        <div className="w-20 h-24 bg-blue-50 rounded-2xl overflow-hidden relative shrink-0 border border-blue-100 group-hover:border-blue-200 transition-colors">
                                            <Image src={item.product?.image_url || "/img/placeholder.png"} alt={item.product?.nama} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0 text-[#0071bc]">
                                            <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest mb-1">SKU: {item.product?.id}</p>
                                            <h4 className={`${fontJudul.className} text-xl uppercase`}>{item.product?.nama}</h4>
                                            <p className="text-[11px] opacity-60 font-medium mt-1 uppercase tracking-wider">
                                                {item.jumlah} Unit • Rp {Number(item.harga_saat_beli).toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                        <div className="text-right text-[#0071bc]">
                                            <p className={`${fontJudul.className} text-lg`}>
                                                Rp {(item.jumlah * Number(item.harga_saat_beli)).toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-[2.5rem] p-10 border border-blue-50 shadow-sm space-y-6 text-[#0071bc]">
                                <div className="flex items-center space-x-3 opacity-40">
                                    <Truck size={16} />
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest">Delivery Address</h3>
                                </div>
                                <p className="text-sm font-light leading-relaxed italic opacity-80">"{order.alamat_pengiriman}"</p>
                                <div className="pt-4">
                                    <span className="text-[9px] bg-[#0071bc] text-white px-3 py-1.5 rounded-full uppercase font-bold tracking-widest">{order.kurir}</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] p-10 border border-blue-50 shadow-sm flex flex-col justify-between space-y-6 text-[#0071bc]">
                                <div>
                                    <div className="flex items-center space-x-3 mb-6 opacity-40">
                                        <MessageSquare size={16} />
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest">Artisan Notes</h3>
                                    </div>
                                    <p className="text-xs italic leading-relaxed opacity-60">
                                        {order.catatan_pengiriman || "No specific instructions provided for this fragrance shipment."}
                                    </p>
                                </div>
                                <div className="pt-6 border-t border-blue-50 flex items-center justify-between opacity-40">
                                    <span className="text-[9px] uppercase font-black tracking-widest">System Record</span>
                                    <span className="text-[9px] font-mono">UID-{order.id}</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* SUMMARY STICKY[cite: 7] */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-[2.5rem] p-10 text-[#0071bc] sticky top-32 shadow-2xl shadow-blue-900/40">
                            <h3 className={`${fontJudul.className} text-2xl uppercase tracking-widest mb-10 border-b border-blue-50 pb-6`}>Investment</h3>
                            <div className="space-y-6 mb-12">
                                <div className="flex justify-between opacity-40 text-[10px] uppercase tracking-[0.2em] font-bold">
                                    <span>Subtotal</span>
                                    <span className="opacity-100">Rp {Number(order.total_harga).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between opacity-40 text-[10px] uppercase tracking-[0.2em] font-bold">
                                    <span>Shipping Fee</span>
                                    <span className="opacity-100">Rp {Number(order.ongkos_kirim).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="h-[1px] bg-blue-50 my-2"></div>
                                <div className="flex flex-col space-y-2">
                                    <span className="text-[9px] opacity-40 font-bold uppercase tracking-[0.3em]">Total Amount</span>
                                    <span className={`${fontJudul.className} text-4xl`}>
                                        Rp {(Number(order.total_harga) + Number(order.ongkos_kirim)).toLocaleString("id-ID")}
                                    </span>
                                </div>
                            </div>

                            {order.status_pembayaran === 'pending' ? (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 shadow-xl bg-[#0071bc] text-white hover:bg-blue-800 hover:-translate-y-1"
                                >
                                    Authorize Payment
                                </button>
                            ) : (
                                <div className="w-full bg-blue-50 border border-blue-100 py-5 rounded-2xl flex items-center justify-center space-x-3">
                                    <ShieldCheck size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">Fulfilled</span>
                                </div>
                            )}

                            <p className="mt-10 text-[9px] opacity-40 text-center leading-relaxed font-light uppercase tracking-widest">
                                Thank you for choosing Evomi.<br />The essence of presence.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}