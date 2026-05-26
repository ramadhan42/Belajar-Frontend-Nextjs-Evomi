"use client";

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - useState & useEffect : manajemen state dan lifecycle komponen
 * - useRouter            : navigasi programatik ke halaman detail pesanan
 * - Lucide Icons         : ikon untuk tombol aksi, pencarian, dan navigasi
 * - BASE_URL             : konstanta URL API global
 * ========================================================================= */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    ChevronRight,
    ChevronLeft,
    Eye,
    CheckCircle2,
    XCircle,
    Trash2
} from "lucide-react";
import { BASE_URL } from "@/src/config/strings";

/* =========================================================================
 * INTERFACE: Order
 * Mendefinisikan struktur data objek pesanan yang diterima dari API.
 * ========================================================================= */
interface Order {
    id: string;
    total_harga: string;
    status_pembayaran: 'pending' | 'success' | 'failed' | 'expired';
    created_at: string;
    customer_name?: string;
}

/* =========================================================================
 * KOMPONEN UTAMA: OrdersPage
 * Halaman manajemen pesanan admin. Menampilkan daftar semua pesanan
 * dengan fitur pencarian, filter status, update status, dan hapus pesanan.
 * ========================================================================= */
export default function OrdersPage() {
    const router = useRouter();

    /* -----------------------------------------------------------------------
     * STATE UTAMA
     * - orders      : array data pesanan dari API
     * - loading     : indikator loading saat fetch data
     * - searchTerm  : nilai input pencarian berdasarkan ID atau nama customer
     * - statusFilter: nilai filter dropdown berdasarkan status pembayaran
     * ----------------------------------------------------------------------- */
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    /* -----------------------------------------------------------------------
     * STATE PAGINATION
     * - currentPage  : halaman aktif pada tabel pesanan
     * - itemsPerPage : jumlah baris yang ditampilkan per halaman (tetap 10)
     * ----------------------------------------------------------------------- */
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    /* -----------------------------------------------------------------------
     * STATE DETAIL & UI
     * - selectedOrder  : pesanan yang sedang dipilih untuk diupdate statusnya
     * - isDetailOpen   : kontrol visibilitas modal update status
     * - isUpdating     : indikator loading saat proses update atau delete
     * ----------------------------------------------------------------------- */
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    /* -----------------------------------------------------------------------
     * STATE MODAL DELETE
     * - isDeleteModalOpen : kontrol visibilitas modal konfirmasi hapus
     * - orderToDelete     : data pesanan yang akan dihapus
     * ----------------------------------------------------------------------- */
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

    /* -----------------------------------------------------------------------
     * KONSTANTA URL ENDPOINT API
     * - STATS_URL        : endpoint untuk mengambil data pesanan via dashboard-stats
     * - ORDER_ACTION_URL : endpoint dinamis untuk aksi update/delete per pesanan
     * ----------------------------------------------------------------------- */
    const STATS_URL = `${BASE_URL}/api/admin/dashboard-stats`;
    const ORDER_ACTION_URL = (id: string) => `${BASE_URL}/api/admin/orders/${id}`;

    /* -----------------------------------------------------------------------
     * EFFECT: Inisialisasi Data
     * Memanggil fetchOrders satu kali saat komponen pertama kali dimuat.
     * ----------------------------------------------------------------------- */
    useEffect(() => {
        fetchOrders();
    }, []);

    /* -----------------------------------------------------------------------
     * FUNGSI: fetchOrders
     * Mengambil daftar pesanan dari endpoint dashboard-stats.
     * Data pesanan diambil dari key 'recent_orders' pada response API.
     * ----------------------------------------------------------------------- */
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_access_token');
            const res = await fetch(STATS_URL, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await res.json();

            // Mengambil data dari key 'recent_orders' sesuai struktur dashboard-stats
            const orderData = data.recent_orders || [];
            setOrders(Array.isArray(orderData) ? orderData : []);
        } catch (error) {
            console.error("Gagal memuat pesanan:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    /* -----------------------------------------------------------------------
     * FUNGSI: updateOrderStatus
     * Memperbarui status pembayaran sebuah pesanan melalui API.
     * - Menggunakan POST dengan _method: 'PUT' (Laravel method spoofing)
     * - Menutup modal detail dan me-refresh data setelah berhasil
     * @param id        - ID pesanan yang akan diperbarui
     * @param newStatus - Status baru: 'success' | 'expired' | 'failed' | 'pending'
     * ----------------------------------------------------------------------- */
    const updateOrderStatus = async (id: string, newStatus: string) => {
        setIsUpdating(true);
        try {
            const token = localStorage.getItem('admin_access_token');
            const res = await fetch(ORDER_ACTION_URL(id), {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ status_pembayaran: newStatus, _method: 'PUT' })
            });

            if (res.ok) {
                setIsDetailOpen(false);
                fetchOrders(); // Refresh data setelah update berhasil
            }
        } catch (error) {
            console.error("Update status error:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    /* -----------------------------------------------------------------------
     * FUNGSI: openDeleteModal
     * Menyimpan data pesanan yang dipilih dan membuka modal konfirmasi hapus.
     * @param order - Objek pesanan yang akan dihapus
     * ----------------------------------------------------------------------- */
    const openDeleteModal = (order: Order) => {
        setOrderToDelete(order);
        setIsDeleteModalOpen(true);
    };

    /* -----------------------------------------------------------------------
     * FUNGSI: confirmDeleteOrder
     * Mengeksekusi penghapusan pesanan setelah dikonfirmasi oleh admin.
     * - Memanggil API DELETE dengan ID pesanan yang dipilih
     * - Menutup modal dan me-refresh data setelah berhasil
     * - isUpdating digunakan sebagai loading state bersama dengan updateOrderStatus
     * ----------------------------------------------------------------------- */
    const confirmDeleteOrder = async () => {
        if (!orderToDelete) return;

        setIsUpdating(true);
        try {
            const token = localStorage.getItem('admin_access_token');
            const res = await fetch(ORDER_ACTION_URL(orderToDelete.id), {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (res.ok) {
                setIsDeleteModalOpen(false);
                setOrderToDelete(null);
                fetchOrders(); // Refresh data setelah hapus berhasil
            }
        } catch (error) {
            console.error("Delete order error:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    /* -----------------------------------------------------------------------
     * LOGIKA FILTER & SEARCH
     * Memfilter array orders berdasarkan:
     * - searchTerm  : mencocokkan ID pesanan atau nama customer (case-insensitive)
     * - statusFilter: mencocokkan status pembayaran, atau 'all' untuk semua
     * ----------------------------------------------------------------------- */
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toString().includes(searchTerm) ||
            order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || order.status_pembayaran === statusFilter;
        return matchesSearch && matchesStatus;
    });

    /* -----------------------------------------------------------------------
     * LOGIKA PAGINATION
     * Menghitung slice data pesanan yang ditampilkan berdasarkan halaman aktif.
     * ----------------------------------------------------------------------- */
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">

                {/* ===================================================================
                 * SEKSI 1: HEADER HALAMAN
                 * Judul halaman, deskripsi, input pencarian, dan filter status.
                 * =================================================================== */}
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                        <p className="text-sm text-gray-500">Gunakan endpoint admin untuk kontrol penuh pesanan.</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {/* Input pencarian berdasarkan ID pesanan */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari ID Pesanan..."
                                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm w-64 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Dropdown filter berdasarkan status pembayaran */}
                        <select
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="success">Success</option>
                            <option value="expired">Expired/Cancel</option>
                        </select>
                    </div>
                </header>

                {/* ===================================================================
                 * SEKSI 2: TABEL DAFTAR PESANAN
                 * Menampilkan pesanan hasil filter dengan kolom:
                 * - ID      : klik untuk navigasi ke halaman detail pesanan
                 * - Status  : badge warna sesuai status pembayaran
                 * - Total   : total harga dalam format Rupiah
                 * - Aksi    : tombol lihat detail (Eye) dan hapus (Trash2)
                 * =================================================================== */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Wrapper scroll horizontal untuk layar kecil */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            {/* Kepala tabel */}
                            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            {/* Baris data pesanan */}
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    /* State loading — tampilkan placeholder teks */
                                    <tr><td colSpan={4} className="p-12 text-center text-gray-400">Loading orders...</td></tr>
                                ) : currentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        {/* Kolom ID — klik untuk ke halaman detail */}
                                        <td className="p-4 font-semibold text-gray-700">
                                            <button onClick={() => router.push(`/admin/orders/${order.id}`)} className="hover:text-indigo-600 flex items-center gap-1">
                                                #{order.id} <ChevronRight size={14} />
                                            </button>
                                        </td>
                                        {/* Kolom Status — badge warna dinamis */}
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${order.status_pembayaran === 'success' ? 'bg-green-100 text-green-700' :
                                                order.status_pembayaran === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {order.status_pembayaran}
                                            </span>
                                        </td>
                                        {/* Kolom Total Harga dalam format IDR */}
                                        <td className="px-6 py-4 font-bold text-sm text-gray-900">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(order.total_harga))}
                                        </td>
                                        {/* Kolom Aksi — tombol detail dan hapus */}
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            {/* Tombol buka modal update status */}
                                            <button
                                                onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {/* Tombol buka modal konfirmasi hapus */}
                                            <button
                                                onClick={() => openDeleteModal(order)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* -----------------------------------------------------------------
                     * NAVIGASI PAGINATION
                     * Menampilkan info halaman aktif dan tombol prev/next.
                     * Tombol dinonaktifkan saat sudah di halaman pertama atau terakhir.
                     * ----------------------------------------------------------------- */}
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Halaman {currentPage} dari {totalPages || 1}</span>
                        <div className="flex gap-2">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 border border-gray-200 rounded-lg bg-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 border border-gray-200 rounded-lg bg-white disabled:opacity-30"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===================================================================
             * SEKSI 3: MODAL KONFIRMASI HAPUS PESANAN
             * Muncul saat admin menekan tombol Trash2 pada baris tabel.
             * Menampilkan ID pesanan yang akan dihapus dan tombol konfirmasi.
             * Backdrop tidak bisa diklik saat proses penghapusan sedang berjalan.
             * =================================================================== */}
            {isDeleteModalOpen && orderToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    {/* Overlay backdrop — klik untuk tutup (jika tidak sedang menghapus) */}
                    <div
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        onClick={() => !isUpdating && setIsDeleteModalOpen(false)}
                    ></div>

                    {/* Konten modal */}
                    <div className="relative bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="text-red-500" size={32} />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Hapus Pesanan?</h3>
                        <p className="text-gray-500 text-sm mb-8 text-center">
                            Apakah Anda yakin ingin menghapus pesanan <span className="font-bold text-gray-900">#{orderToDelete.id}</span>? Tindakan ini tidak dapat dibatalkan.
                        </p>

                        <div className="space-y-3">
                            {/* Tombol konfirmasi hapus — disabled saat proses berjalan */}
                            <button
                                disabled={isUpdating}
                                onClick={confirmDeleteOrder}
                                className="w-full py-4 rounded-2xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                            >
                                {isUpdating ? "MENGHAPUS..." : "YA, HAPUS SEKARANG"}
                            </button>

                            {/* Tombol batal */}
                            <button
                                disabled={isUpdating}
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="w-full py-4 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                BATALKAN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================================================================
             * SEKSI 4: MODAL UPDATE STATUS PESANAN
             * Muncul saat admin menekan tombol Eye pada baris tabel.
             * Menampilkan dua pilihan aksi: set Success atau set Expired/Cancel.
             * Semua tombol dinonaktifkan saat proses update sedang berjalan.
             * =================================================================== */}
            {isDetailOpen && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Overlay backdrop — klik untuk tutup modal */}
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)}></div>

                    {/* Konten modal */}
                    <div className="relative bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Update Pesanan #{selectedOrder.id}</h3>
                        <p className="text-gray-500 text-sm mb-8 text-center">Pilih status terbaru untuk pesanan ini.</p>

                        <div className="space-y-3">
                            {/* Tombol set status Success */}
                            <button
                                disabled={isUpdating}
                                onClick={() => updateOrderStatus(selectedOrder.id, 'success')}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-all"
                            >
                                <CheckCircle2 size={18} /> SET SUCCESS
                            </button>
                            {/* Tombol set status Expired/Cancel */}
                            <button
                                disabled={isUpdating}
                                onClick={() => updateOrderStatus(selectedOrder.id, 'expired')}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-all"
                            >
                                <XCircle size={18} /> SET EXPIRED / CANCEL
                            </button>
                            {/* Tombol kembali / tutup modal */}
                            <button
                                onClick={() => setIsDetailOpen(false)}
                                className="w-full py-4 text-xs font-bold text-gray-400 hover:text-gray-600"
                            >
                                KEMBALI
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
