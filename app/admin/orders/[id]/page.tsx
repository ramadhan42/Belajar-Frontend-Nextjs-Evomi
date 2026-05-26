'use client';

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - useEffect & useState : manajemen state dan lifecycle komponen
 * - useParams            : mengambil parameter dinamis [id] dari URL
 * - useRouter            : navigasi programatik (back, redirect)
 * - Lucide Icons         : ikon untuk elemen UI kartu dan navigasi
 * - Image                : komponen gambar optimasi dari Next.js
 * - BASE_URL             : konstanta URL API global
 * ========================================================================= */
import { useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Package, Truck, MapPin, CreditCard, Clock, User as UserIcon
} from "lucide-react";
import Image from "next/image";
import { BASE_URL } from "@/src/config/strings";

/* =========================================================================
 * KOMPONEN UTAMA: AdminOrderDetail
 * Halaman detail pesanan admin. Menampilkan informasi lengkap satu pesanan
 * berdasarkan ID dinamis dari URL, meliputi:
 * - Daftar produk yang dipesan
 * - Informasi pengiriman dan catatan
 * - Ringkasan pembayaran
 * - Kontrol update status pembayaran langsung dari navbar
 * ========================================================================= */
export default function AdminOrderDetail() {
  const params = useParams();
  const router = useRouter();

  /* -----------------------------------------------------------------------
   * EKSTRAKSI PARAMETER URL
   * Mengambil ID pesanan dari params URL secara aman.
   * ----------------------------------------------------------------------- */
  const orderId = params?.id;

  /* -----------------------------------------------------------------------
   * STATE UTAMA
   * - order    : data lengkap pesanan dari API (produk, alamat, pembayaran)
   * - loading  : indikator loading saat fetch data berlangsung
   * - errorMsg : pesan error jika API gagal atau pesanan tidak ditemukan
   * ----------------------------------------------------------------------- */
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* -----------------------------------------------------------------------
   * FUNGSI: fetchOrderDetail
   * Mengambil data detail satu pesanan dari API berdasarkan orderId.
   * - Membatalkan fetch jika orderId belum tersedia
   * - Menyimpan data ke state order jika response sukses
   * - Menyimpan pesan error ke state errorMsg jika response gagal
   * ----------------------------------------------------------------------- */
  const fetchOrderDetail = async () => {
    if (!orderId) return; // Cegah fetch jika ID belum ada

    try {
      setLoading(true);
      setErrorMsg(null);
      const token = localStorage.getItem("admin_access_token");

      const response = await fetch(`${BASE_URL}/api/admin/orders/${orderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setOrder(result.data);
      } else {
        console.error("API Error:", result.message);
        setErrorMsg(result.message || "Pesanan tidak ditemukan dari server.");
        setOrder(null);
      }
    } catch (error) {
      console.error("Network Error:", error);
      setErrorMsg("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------------------------------------------------
   * EFFECT: Inisialisasi Data
   * Memanggil fetchOrderDetail setiap kali orderId berubah.
   * Bergantung pada orderId agar re-fetch terjadi jika navigasi antar detail.
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  /* -----------------------------------------------------------------------
   * FUNGSI: handleStatusChange
   * Memperbarui status pembayaran pesanan melalui API.
   * - Menggunakan POST dengan _method: 'PUT' (Laravel method spoofing)
   * - Me-refresh data detail pesanan setelah update berhasil
   * @param newStatus - Status baru: 'pending' | 'success' | 'failed' | 'expired'
   * ----------------------------------------------------------------------- */
  const handleStatusChange = async (newStatus: string) => {
    const token = localStorage.getItem('admin_access_token');
    try {
      const response = await fetch(`${BASE_URL}/api/admin/orders/${order.id}`, {
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
        fetchOrderDetail(); // Refresh data setelah update berhasil
      }
    } catch (error) {
      console.error("Gagal update status:", error);
    }
  };

  /* -----------------------------------------------------------------------
   * LOADING STATE
   * Menampilkan spinner saat data pesanan belum selesai dimuat.
   * ----------------------------------------------------------------------- */
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  /* -----------------------------------------------------------------------
   * ERROR STATE
   * Menampilkan pesan error beserta tombol kembali jika API gagal
   * atau pesanan tidak ditemukan (404).
   * ----------------------------------------------------------------------- */
  if (errorMsg || !order) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-10 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-500 mb-6">{errorMsg || "Order tidak ditemukan."}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Kembali
        </button>
      </div>
    </div>
  );

  /* -----------------------------------------------------------------------
   * FALLBACK STATE
   * Guard tambahan jika order masih null setelah loading selesai.
   * ----------------------------------------------------------------------- */
  if (!order) return <div className="p-10 text-center">Order tidak ditemukan.</div>;

  /* =========================================================================
   * RENDER UTAMA
   * ========================================================================= */
  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">

      {/* ===================================================================
       * SEKSI 1: NAVBAR STICKY
       * Menampilkan tombol kembali, judul pesanan, dan dropdown update status.
       * Sticky di atas layar agar selalu dapat diakses saat scroll.
       * =================================================================== */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Tombol kembali ke halaman sebelumnya */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="font-bold text-gray-800">Detail Pesanan #{order.id}</h1>
          </div>

          {/* Dropdown update status pembayaran langsung dari navbar */}
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

      {/* ===================================================================
       * SEKSI 2: KONTEN UTAMA (GRID 2 KOLOM)
       * Layout grid: kolom kiri (2/3) untuk detail produk & pengiriman,
       * kolom kanan (1/3) untuk ringkasan pembayaran sticky.
       * =================================================================== */}
      <main className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* -----------------------------------------------------------------
           * KOLOM KIRI: DETAIL PRODUK & INFORMASI PENGIRIMAN
           * ----------------------------------------------------------------- */}
          <div className="lg:col-span-2 space-y-6">

            {/* ---------------------------------------------------------------
             * KARTU: DAFTAR ITEM PESANAN
             * Menampilkan setiap produk dalam pesanan beserta:
             * - Gambar produk
             * - Nama dan ID produk
             * - Jumlah dan harga satuan
             * - Subtotal per item
             * --------------------------------------------------------------- */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <Package size={18} className="text-indigo-600" />
                <h2 className="font-bold text-gray-800">Item Pesanan</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {order.details?.map((item: any) => (
                  <div key={item.id} className="p-6 flex items-center gap-6 group">
                    {/* Gambar produk */}
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100">
                      <Image
                        src={item.product?.image_url || "/img/placeholder.png"}
                        alt={item.product?.nama}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Info produk */}
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter mb-1">{item.product_id}</p>
                      <h4 className="font-bold text-gray-900 leading-tight">{item.product?.nama}</h4>
                      <p className="text-xs text-gray-500 mt-1">{item.jumlah} x Rp {Number(item.harga_saat_beli).toLocaleString('id-ID')}</p>
                    </div>
                    {/* Subtotal per item */}
                    <div className="text-right">
                      <p className="font-bold text-gray-900">Rp {(item.jumlah * item.harga_saat_beli).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ---------------------------------------------------------------
             * GRID: INFO PENGIRIMAN & CATATAN
             * Dua kartu berdampingan:
             * - Kiri  : alamat pengiriman dan nama kurir
             * - Kanan : catatan pengiriman dan waktu pembuatan pesanan
             * --------------------------------------------------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kartu: Alamat Pengiriman */}
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

              {/* Kartu: Catatan & Waktu Pesanan */}
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

          {/* -----------------------------------------------------------------
           * KOLOM KANAN: RINGKASAN PEMBAYARAN (STICKY)
           * Menampilkan breakdown biaya:
           * - Subtotal produk
           * - Ongkos kirim
           * - Total bayar (subtotal + ongkir)
           * - Info Customer ID
           * Sticky agar tetap terlihat saat admin scroll daftar produk.
           * ----------------------------------------------------------------- */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden sticky top-24">
              {/* Header kartu ringkasan */}
              <div className="bg-indigo-600 p-8 text-white">
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  <CreditCard size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Ringkasan</span>
                </div>
                <h3 className="text-2xl font-bold italic">Payment Detail</h3>
              </div>

              {/* Rincian biaya */}
              <div className="p-8 space-y-4">
                {/* Baris subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">Rp {Number(order.total_harga).toLocaleString('id-ID')}</span>
                </div>
                {/* Baris ongkos kirim */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ongkos Kirim</span>
                  <span className="font-semibold text-gray-900">Rp {Number(order.ongkos_kirim).toLocaleString('id-ID')}</span>
                </div>
                <div className="h-[1px] bg-gray-100 my-2"></div>
                {/* Baris total bayar */}
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Bayar</span>
                  <span className="text-2xl font-black text-indigo-600">
                    Rp {(Number(order.total_harga) + Number(order.ongkos_kirim)).toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Info Customer ID */}
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
