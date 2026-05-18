"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { BASE_URL } from "@/src/config/strings";

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css'; // Ganti path css-nya

// Render ReactQuill secara dinamis menggunakan package baru
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

// Interface berdasarkan kebutuhan artikel Evomi
interface Article {
    id: string;
    title: string;
    slug: string;
    content: string;
    author?: string;
    image_url?: string;
    created_at: string;
}

// Artikel Menu Page
export default function ArticlesMenu() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // --- State untuk Modal Konfirmasi Hapus ---
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; articleId: string | null }>({
        isOpen: false,
        articleId: null,
    });

    // --- State untuk Pagination ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Fungsi untuk navigasi halaman
    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    // State pesan sukses
    const [successModal, setSuccessModal] = useState({
        isOpen: false,
        message: "",
        type: ""
    });

    // State untuk form data artikel
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        author: "Evomi Editorial",
        content: ""
    });

    const API_URL = `${BASE_URL}/api/articles`;

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setArticles(data.success ? data.data : data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Logika Pagination ---
    const totalPages = Math.ceil(articles.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = articles.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [articles, totalPages, currentPage]);

    const showSuccess = (message: string, type: string) => {
        setSuccessModal({ isOpen: true, message, type });
        setTimeout(() => {
            setSuccessModal(prev => ({ ...prev, isOpen: false }));
        }, 3000);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleContentChange = (content: string) => {
        setFormData({ ...formData, content });
    };

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        // Benar-benar hanya mengubah title, slug tidak akan ikut campur
        setFormData({
            ...formData,
            title: title
        });
    };

    const openCreateModal = () => {
        setFormData({ title: "", slug: "", author: "Evomi Editorial", content: "" });
        setImageFile(null);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (article: Article) => {
        setFormData({
            title: article.title,
            slug: article.slug || "",
            author: article.author || "Evomi Editorial",
            content: article.content
        });
        setEditingId(article.id);
        setImageFile(null);
        setIsModalOpen(true);
    };

    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append("title", formData.title);
        data.append("slug", formData.slug);
        data.append("author", formData.author);
        data.append("content", formData.content);

        if (imageFile) {
            data.append("image", imageFile);
        }

        if (editingId) {
            data.append("_method", "PUT");
        }

        const url = editingId ? `${API_URL}/${editingId}` : API_URL;

        try {
            const res = await fetch(url, {
                method: "POST",
                body: data,
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchArticles();
                showSuccess(
                    editingId ? "Artikel berhasil diperbarui!" : "Artikel baru berhasil dipublikasikan!",
                    editingId ? "update" : "create"
                );
            }
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    // --- Fungsi Buka Modal Hapus ---
    const confirmDelete = (id: string) => {
        setDeleteModal({ isOpen: true, articleId: id });
    };

    // --- Fungsi Eksekusi Hapus ---
    const executeDelete = async () => {
        if (!deleteModal.articleId) return;

        try {
            const res = await fetch(`${API_URL}/${deleteModal.articleId}`, { method: "DELETE" });
            if (res.ok) {
                fetchArticles();
                showSuccess("Artikel telah dihapus dari database.", "delete");
            }
        } catch (error) {
            console.error("Delete error:", error);
        } finally {
            // Tutup modal hapus setelah selesai (berhasil/gagal)
            setDeleteModal({ isOpen: false, articleId: null });
        }
    };

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setImageFile(e.target.files[0]);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Success Popup Modal */}
            {successModal.isOpen && (
                <div className="fixed bottom-10 right-10 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-2xl p-4 flex items-center gap-4 min-w-[320px] backdrop-blur-lg bg-white/90">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${successModal.type === 'delete' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                            {successModal.type === 'delete' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-1.816c0-1.107-.893-2.003-2.01-2.003h-2.23c-1.107 0-2.01.896-2.01 2.003V6" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900">Berhasil!</h4>
                            <p className="text-xs text-gray-500">{successModal.message}</p>
                        </div>
                        <button onClick={() => setSuccessModal({ ...successModal, isOpen: false })} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                    </div>
                </div>
            )}

            {/* --- CUSTOM DELETE MODAL --- */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden transform scale-100 transition-all">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Artikel?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Ingin Menghapus Artikel Ini, Artikel Akan Terhapus Dari List dan Database.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setDeleteModal({ isOpen: false, articleId: null })}
                                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-all w-full"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={executeDelete}
                                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-sm transition-all w-full"
                                >
                                    Ya, Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* --------------------------- */}

            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Evomi Journal</h1>
                        <p className="text-sm text-gray-500">Kelola cerita, panduan, dan pembaruan brand untuk pelanggan.</p>
                    </div>
                    <button onClick={openCreateModal} className="bg-black text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all">
                        + Artikel Baru
                    </button>
                </div>

                {/* Tabel Artikel */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="hidden md:table-header-group bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Artikel</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Penulis</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tanggal Terbit</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 flex flex-col md:table-row-group">
                                {isLoading ? (
                                    <tr><td colSpan={4} className="p-10 text-center text-gray-400">Memuat Jurnal...</td></tr>
                                ) : currentItems.map((article) => (
                                    <tr key={article.id} className="hover:bg-gray-50/50 transition-colors flex flex-col md:table-row p-4 md:p-0">
                                        <td className="px-0 py-2 md:px-6 md:py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                                                    {article.image_url ? <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">Cover</div>}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="text-sm font-bold text-gray-900 truncate max-w-[200px] md:max-w-xs">{article.title}</div>
                                                    <div className="text-[10px] text-gray-400 font-mono">{article.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-0 py-2 md:px-6 md:py-4">
                                            <span className="md:hidden text-[9px] font-bold text-gray-400 uppercase mb-1 block">Penulis</span>
                                            <div className="text-xs text-gray-600 font-medium">{article.author || 'Editorial'}</div>
                                        </td>
                                        <td className="px-0 py-2 md:px-6 md:py-4">
                                            <span className="md:hidden text-[9px] font-bold text-gray-400 uppercase mb-1 block">Terbit Pada</span>
                                            <div className="text-xs text-gray-400">{new Date(article.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                        </td>
                                        <td className="px-0 py-4 md:px-6 md:py-4 border-t md:border-t-0 mt-2 md:mt-0 pt-4 md:pt-4">
                                            <div className="flex items-center justify-end gap-4 md:gap-3">
                                                <button onClick={() => openEditModal(article)} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold transition-all">Edit</button>

                                                {/* Button Hapus kini memanggil confirmDelete, bukan handleDelete */}
                                                <button onClick={() => confirmDelete(article.id)} className="text-red-500 hover:text-red-700 text-xs font-bold transition-all">Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* --- FOOTER PAGINATION --- */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-xs text-gray-500 font-medium">
                            Menampilkan <span className="text-black font-bold">{indexOfFirstItem + 1}</span> - <span className="text-black font-bold">{Math.min(indexOfLastItem, articles.length)}</span> dari <span className="text-black font-bold">{articles.length}</span> artikel
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-1">
                                <span className="text-xs font-bold px-3 py-1 bg-black text-white rounded-md">{currentPage}</span>
                                <span className="text-xs text-gray-400 mx-1">dari</span>
                                <span className="text-xs font-bold text-gray-600">{totalPages || 1}</span>
                            </div>

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal CRUD - Diperbesar menjadi max-w-4xl */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 overflow-y-auto">
                        <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-gray-100 overflow-hidden my-8">
                            <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                                <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                                    <h2 className="text-xl font-bold">{editingId ? 'Edit Artikel' : 'Tulis Cerita Baru'}</h2>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
                                </div>

                                {/* Layout Grid 1/3 (Meta) dan 2/3 (Editor) */}
                                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 overflow-y-auto">
                                    {/* Bagian Kiri: Meta Data */}
                                    <div className="space-y-4 md:col-span-1">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Judul Artikel</label>
                                            <input name="title" value={formData.title} onChange={handleTitleChange} className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black" placeholder="Masukan judul..." required />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Slug (URL)</label>
                                            <input name="slug" value={formData.slug} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black font-mono text-gray-600" placeholder="contoh-judul-artikel" required />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Penulis</label>
                                            <input name="author" value={formData.author} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Cover Image</label>
                                            <input type="file" onChange={handleFileChange} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 w-full" />
                                        </div>
                                    </div>

                                    {/* Bagian Kanan: Rich Text Editor */}
                                    <div className="space-y-2 md:col-span-2 flex flex-col">
                                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Konten Artikel</label>
                                        <div className="flex-1 bg-white border rounded-xl overflow-hidden focus-within:border-black transition-colors">
                                            <ReactQuill
                                                theme="snow"
                                                value={formData.content}
                                                onChange={handleContentChange}
                                                modules={quillModules}
                                                className="h-[300px] border-none"
                                                placeholder="Tulis cerita jurnal di sini..."
                                            />
                                        </div>
                                        {/* CSS Fix untuk Quill agar border terlihat clean seperti desain SaaS */}
                                        <style jsx global>{`
                                            .ql-toolbar.ql-snow { border: none; border-bottom: 1px solid #f3f4f6; padding: 12px; background: #f9fafb; }
                                            .ql-container.ql-snow { border: none; }
                                            .ql-editor { min-height: 250px; font-size: 14px; }
                                        `}</style>
                                    </div>
                                </div>

                                <div className="px-8 py-6 bg-gray-50 flex justify-end gap-3 sticky bottom-0 z-10 border-t border-gray-100">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-gray-600">Batal</button>
                                    <button type="submit" className="px-8 py-2 bg-black text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all">
                                        {editingId ? 'Update Jurnal' : 'Publish Sekarang'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}