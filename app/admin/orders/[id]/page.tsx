'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Clock,
  User as UserIcon,
  ChevronRight
} from "lucide-react";
import Image from "next/image";

// String global url
import { BASE_URL } from "@/src/config/strings";

// Component
export default function AdminOrderDetail() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetching Data Order
  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_access_token");   // Ambil token dari localStorage

      // Gunakan params.id langsung
      const response = await fetch(BASE_URL + `/api/admin/orders/${params.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        // KRITIKAL: Laravel mengirim { status: "success", data: {...} }
        // Maka kita harus ambil result.data
        setOrder(result.data);
      } else {
        // Ini yang memunculkan pesan "Pesanan tidak ditemukan"
        console.error("API Error:", result.message);
        setOrder(null);
      }
    } catch (error) {
      console.error("Network Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lifecycle
  useEffect(() => {
    if (params.id) fetchOrderDetail();
  }, [params.id]);

  // Fungsi Update Status (Sama seperti di dashboard)
  const handleStatusChange = async (newStatus: string) => {
    const token = localStorage.getItem('admin_access_token');
    try {
      const response = await fetch(BASE_URL + `/api/admin/orders/${order.id}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status_pembayaran: newStatus,
          _method: 'PUT'
        }),
      });

      if (response.ok) {
        fetchOrderDetail(); // Refresh data
      }
    } catch (error) {
      console.error("Gagal update status:", error);
    }
  };

  // Loading State
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!order) return <div className="p-10 text-center">Order tidak ditemukan.</div>;

  // Render UI
  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="font-bold text-gray-800">Detail Pesanan #{order.id}</h1>
          </div>

          {/* Status Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Status:</span>
            <select
              value={order.status_pembayaran}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border-none shadow-sm cursor-pointer transition-all ${order.status_pembayaran === 'success' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}
            >
              <option value="pending">Pending</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* KOLOM KIRI (Daftar Produk & Pengiriman) */}
          <div className="lg:col-span-2 space-y-6">

            {/* CARD: DAFTAR PRODUK */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <Package size={18} className="text-indigo-600" />
                <h2 className="font-bold text-gray-800">Item Pesanan</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {order.details?.map((item: any) => (
                  <div key={item.id} className="p-6 flex items-center gap-6 group">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100">
                      <Image
                        src={item.product?.image_url || "/img/placeholder.png"}
                        alt={item.product?.nama}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter mb-1">{item.product_id}</p>
                      <h4 className="font-bold text-gray-900 leading-tight">{item.product?.nama}</h4>
                      <p className="text-xs text-gray-500 mt-1">{item.jumlah} x Rp {Number(item.harga_saat_beli).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">Rp {(item.jumlah * item.harga_saat_beli).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GRID: INFO PENGIRIMAN & CUSTOMER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alamat */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-gray-400">
                  <MapPin size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Alamat Pengiriman</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {order.alamat_pengiriman}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                  <Truck size={14} className="text-indigo-500" />
                  <span className="text-xs font-bold text-gray-900">{order.kurir}</span>
                </div>
              </div>

              {/* Catatan */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-gray-400">
                  <Clock size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Catatan & Waktu</span>
                </div>
                <p className="text-xs text-gray-500 italic mb-4">
                  "{order.catatan_pengiriman || 'Tidak ada catatan'}"
                </p>
                <p className="text-[10px] text-gray-400">
                  Dibuat pada: {new Date(order.created_at).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN (Ringkasan Pembayaran) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden sticky top-24">
              <div className="bg-indigo-600 p-8 text-white">
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  <CreditCard size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Ringkasan</span>
                </div>
                <h3 className="text-2xl font-bold italic">Payment Detail</h3>
              </div>

              <div className="p-8 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">Rp {Number(order.total_harga).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ongkos Kirim</span>
                  <span className="font-semibold text-gray-900">Rp {Number(order.ongkos_kirim).toLocaleString('id-ID')}</span>
                </div>
                <div className="h-[1px] bg-gray-100 my-2"></div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Bayar</span>
                  <span className="text-2xl font-black text-indigo-600">
                    Rp {(Number(order.total_harga) + Number(order.ongkos_kirim)).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                      <UserIcon size={16} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Customer ID</p>
                      <p className="text-sm font-bold text-gray-800">User #{order.user_id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}