'use client';

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Trash2,
  AlertTriangle
} from "lucide-react";

// String global url
import { BASE_URL } from "@/src/config/strings";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false); // State loading saat hapus
  const router = useRouter();

  // --- STATE UNTUK PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // --- STATE UNTUK MODAL NOTIFIKASI ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' });

  // --- STATE UNTUK MODAL DELETE CUSTOM ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);

  const showModal = (title: string, message: string, type = 'success') => {
    setModalConfig({ title, message, type });
    setIsModalOpen(true);
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(BASE_URL + '/api/admin/dashboard-stats', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        router.push('/admin-login');
        return;
      }

      const data = await response.json();
      const calculatedRevenue = data.recent_orders?.reduce((acc: number, order: any) => {
        return order.status_pembayaran === 'success' ? acc + parseFloat(order.total_harga) : acc;
      }, 0) || 0;

      setStats({ ...data, total_revenue_success: calculatedRevenue });
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FUNGSI DELETE CUSTOM ---
  const openDeleteModal = (order: any) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    setIsDeleting(true);
    const token = localStorage.getItem('admin_access_token');
    try {
      const response = await fetch(BASE_URL + `/api/admin/orders/${orderToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsDeleteModalOpen(false);
        showModal("Berhasil", `Pesanan #${orderToDelete.id} telah dihapus selamanya.`, "success");
        await fetchData();
      }
    } catch (error) {
      showModal("Error", "Gagal menghapus data dari server.", "error");
    } finally {
      setIsDeleting(false);
      setOrderToDelete(null);
    }
  };

  const handleStatusChange = async (orderId: any, newStatus: string) => {
    const token = localStorage.getItem('admin_access_token');
    try {
      const response = await fetch(BASE_URL + `/api/admin/orders/${orderId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status_pembayaran: newStatus, _method: 'PUT' }),
      });

      if (response.ok) {
        showModal("Update Berhasil", `Status pesanan #${orderId} kini menjadi ${newStatus}.`, "success");
        await fetchData();
      }
    } catch (error) {
      showModal("Error", "Gagal memperbarui status.", "error");
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = stats?.recent_orders?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = Math.ceil((stats?.recent_orders?.length || 0) / itemsPerPage);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* 1. MODAL NOTIFIKASI (Global) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{modalConfig.title}</h3>
            <p className="text-gray-500 text-sm mb-8">{modalConfig.message}</p>
            <button onClick={() => setIsModalOpen(false)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Tutup</button>
          </div>
        </div>
      )}

      {/* 2. MODAL DELETE CUSTOM (Dashboard) */}
      {isDeleteModalOpen && orderToDelete && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => !isDeleting && setIsDeleteModalOpen(false)}></div>
          <div className="relative bg-white rounded-[2.5rem] p-10 text-center max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Hapus Pesanan?</h3>
            <p className="text-gray-500 text-sm mb-10 leading-relaxed">
              Pesanan <span className="font-bold text-gray-900">#{orderToDelete.id}</span> akan dihapus permanen dari sistem. Tindakan ini tidak bisa dibatalkan.
            </p>

            <div className="space-y-3">
              <button
                disabled={isDeleting}
                onClick={confirmDeleteOrder}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold text-xs tracking-widest uppercase hover:bg-red-600 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
              >
                {isDeleting ? "SEDANG MENGHAPUS..." : "YA, HAPUS SEKARANG"}
              </button>
              <button
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full py-4 text-gray-400 font-bold text-xs tracking-widest uppercase hover:text-gray-600 transition-colors"
              >
                BATALKAN
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-6 sm:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Ringkasan aktivitas toko Evomi hari ini.</p>
        </header>

        {/* Statistik Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div onClick={() => router.push('/admin/products')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
            <div className="flex justify-between items-center"><p className="text-gray-500 text-sm font-medium uppercase">Total Produk</p><ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-600" /></div>
            <h3 className="text-4xl font-extrabold text-gray-900 mt-2">{stats?.total_products || 0}</h3>
          </div>
          <div onClick={() => router.push('/admin/orders')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
            <div className="flex justify-between items-center"><p className="text-gray-500 text-sm font-medium uppercase">Total Pesanan</p><ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-600" /></div>
            <h3 className="text-4xl font-extrabold text-gray-900 mt-2">{stats?.total_orders || 0}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium uppercase">Total Pendapatan</p>
            <h3 className="text-4xl font-extrabold text-indigo-600 mt-2">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats?.total_revenue_success || 0)}</h3>
          </div>
        </div>

        {/* Tabel Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-xs border border-gray-200 rounded-lg p-1 outline-none">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-600 text-xs uppercase font-bold tracking-widest">
                <tr>
                  <th className="p-4">ID Pesanan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Total</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-semibold text-gray-700">
                      <button onClick={() => router.push(`/admin/orders/${order.id}`)} className="hover:text-indigo-600 flex items-center gap-1">
                        #{order.id} <ChevronRight size={14} />
                      </button>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status_pembayaran || 'pending'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border-none outline-none cursor-pointer ${order.status_pembayaran === 'success' ? 'bg-green-100 text-green-700' :
                            (order.status_pembayaran === 'failed' || order.status_pembayaran === 'expired' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')
                          }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="success">Success</option>
                        <option value="expired">Cancel/Expired</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td className="p-4 font-bold text-gray-900">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.total_harga || 0)}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => openDeleteModal(order)} // Memanggil Modal Custom
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Navigasi Pagination */}
          <div className="p-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
            <span className="text-xs text-gray-500">Halaman {currentPage} dari {totalPages || 1}</span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}