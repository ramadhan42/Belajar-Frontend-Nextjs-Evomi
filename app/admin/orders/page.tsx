"use client";

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

interface Order {
    id: string;
    total_harga: string;
    status_pembayaran: 'pending' | 'success' | 'failed' | 'expired';
    created_at: string;
    customer_name?: string;
}

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // State Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // State Detail & UI
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // ... state lainnya
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

    // Endpoint URLs
    const STATS_URL = `${BASE_URL}/api/admin/dashboard-stats`;
    const ORDER_ACTION_URL = (id: string) => `${BASE_URL}/api/admin/orders/${id}`;


    useEffect(() => {
        fetchOrders();
    }, []);

    // 1. GET ORDERS (Mengambil dari recent_orders di dashboard-stats)
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

    // 2. UPDATE ORDER STATUS
    const updateOrderStatus = async (id: string, newStatus: string) => {
        setIsUpdating(true);
        try {
            const token = localStorage.getItem('admin_access_token');
            const res = await fetch(ORDER_ACTION_URL(id), {
                method: "POST", // Menggunakan POST dengan _method PUT jika Laravel, atau langsung PUT
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ status_pembayaran: newStatus, _method: 'PUT' })
            });

            if (res.ok) {
                setIsDetailOpen(false);
                fetchOrders(); // Refresh data
            }
        } catch (error) {
            console.error("Update status error:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // 3. DELETE ORDER
    // Fungsi untuk membuka modal konfirmasi
    const openDeleteModal = (order: Order) => {
        setOrderToDelete(order);
        setIsDeleteModalOpen(true);
    };

    // Fungsi eksekusi hapus yang dipanggil dari modal
    const confirmDeleteOrder = async () => {
        if (!orderToDelete) return;

        setIsUpdating(true); // Gunakan loading state yang sama
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
                fetchOrders(); // Refresh data
            }
        } catch (error) {
            console.error("Delete order error:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // --- LOGIKA FILTER & PAGINATION ---
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toString().includes(searchTerm) ||
            order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || order.status_pembayaran === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Logika pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                        <p className="text-sm text-gray-500">Gunakan endpoint admin untuk kontrol penuh pesanan.</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
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

                {/* Tabel */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-12 text-center text-gray-400">Loading orders...</td></tr>
                                ) : currentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 font-semibold text-gray-700">
                                            <button onClick={() => router.push(`/admin/orders/${order.id}`)} className="hover:text-indigo-600 flex items-center gap-1">
                                                #{order.id} <ChevronRight size={14} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${order.status_pembayaran === 'success' ? 'bg-green-100 text-green-700' :
                                                order.status_pembayaran === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {order.status_pembayaran}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-sm text-gray-900">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(order.total_harga))}
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(order)} // Ganti ini
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

                    {/* Pagination Footer */}
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Halaman {currentPage} dari {totalPages || 1}</span>
                        <div className="flex gap-2">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 border border-gray-200 rounded-lg bg-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 border border-gray-200 rounded-lg bg-white disabled:opacity-30"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Konfirmasi Hapus Kustom */}
            {isDeleteModalOpen && orderToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        onClick={() => !isUpdating && setIsDeleteModalOpen(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="text-red-500" size={32} />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Hapus Pesanan?</h3>
                        <p className="text-gray-500 text-sm mb-8 text-center">
                            Apakah Anda yakin ingin menghapus pesanan <span className="font-bold text-gray-900">#{orderToDelete.id}</span>? Tindakan ini tidak dapat dibatalkan.
                        </p>

                        <div className="space-y-3">
                            <button
                                disabled={isUpdating}
                                onClick={confirmDeleteOrder}
                                className="w-full py-4 rounded-2xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                            >
                                {isUpdating ? "MENGHAPUS..." : "YA, HAPUS SEKARANG"}
                            </button>

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

            {/* Modal Update Status */}
            {isDetailOpen && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)}></div>
                    <div className="relative bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Update Pesanan #{selectedOrder.id}</h3>
                        <p className="text-gray-500 text-sm mb-8 text-center">Pilih status terbaru untuk pesanan ini.</p>

                        <div className="space-y-3">
                            <button
                                disabled={isUpdating}
                                onClick={() => updateOrderStatus(selectedOrder.id, 'success')}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-all"
                            >
                                <CheckCircle2 size={18} /> SET SUCCESS
                            </button>
                            <button
                                disabled={isUpdating}
                                onClick={() => updateOrderStatus(selectedOrder.id, 'expired')}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-all"
                            >
                                <XCircle size={18} /> SET EXPIRED / CANCEL
                            </button>
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