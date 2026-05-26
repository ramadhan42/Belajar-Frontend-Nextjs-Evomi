"use client";

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - useState, useEffect  : manajemen state dan lifecycle komponen
 * - ChangeEvent, FormEvent : tipe event untuk input form dan submit
 * - dynamic              : lazy load ReactQuill agar tidak di-render di server (SSR: false)
 * - ReactQuill CSS        : stylesheet bawaan editor rich text
 * - BASE_URL             : konstanta URL API global
 * ========================================================================= */
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import { BASE_URL } from "@/src/config/strings";

/* =========================================================================
 * INTERFACE: Product
 * Mendefinisikan struktur data objek produk yang diterima dari API.
 * ========================================================================= */
interface Product {
    id: string;
    brand_id: number;
    nama: string;
    deskripsi?: string;
    ukuran?: string;
    konsentrasi?: string;
    gender?: string;
    ketahanan?: string;
    sillage?: string;
    proyeksi?: string;
    vibe?: string;
    image_url?: string;
    harga_retail: number;
    stok_tersedia: number;
    status_stok?: string;
}

/* =========================================================================
 * KOMPONEN UTAMA: ProductsMenu
 * Halaman manajemen inventori produk admin. Fitur utama:
 * - Menampilkan daftar produk dalam tabel dengan pagination
 * - Tambah produk baru via modal form
 * - Edit produk yang sudah ada via modal form yang sama
 * - Hapus produk dengan konfirmasi browser
 * - Notifikasi toast otomatis setelah aksi berhasil
 * ========================================================================= */
export default function ProductsMenu() {

    /* -----------------------------------------------------------------------
     * STATE UTAMA
     * - products   : array data produk dari API
     * - isLoading  : indikator loading saat fetch data pertama kali
     * - isModalOpen: kontrol visibilitas modal form CRUD
     * - editingId  : ID produk yang sedang diedit, null jika mode tambah baru
     * - imageFile  : file gambar yang dipilih dari input file
     * ----------------------------------------------------------------------- */
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    /* -----------------------------------------------------------------------
     * STATE PAGINATION
     * - currentPage  : halaman aktif pada tabel produk
     * - itemsPerPage : jumlah baris yang ditampilkan per halaman (tetap 5)
     * ----------------------------------------------------------------------- */
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    /* -----------------------------------------------------------------------
     * STATE TOAST NOTIFIKASI
     * - successModal.isOpen   : kontrol visibilitas toast
     * - successModal.message  : pesan yang ditampilkan di toast
     * - successModal.type     : tipe aksi: 'create' | 'update' | 'delete'
     * ----------------------------------------------------------------------- */
    const [successModal, setSuccessModal] = useState({
        isOpen: false,
        message: "",
        type: ""
    });

    /* -----------------------------------------------------------------------
     * STATE FORM DATA
     * Menyimpan semua nilai input form produk.
     * Digunakan untuk mode tambah baru maupun edit produk.
     * ----------------------------------------------------------------------- */
    const [formData, setFormData] = useState({
        id: "",
        brand_id: 4,
        nama: "",
        harga_retail: 0,
        stok_tersedia: 0,
        ukuran: "50ml",
        konsentrasi: "Eau de Parfum (EDP)",
        vibe: "",
        deskripsi: "",
        gender: "Unisex",
        ketahanan: "",
        sillage: "",
        proyeksi: "2-3 Meter",
        status_stok: "Available Stock"
    });

    /* -----------------------------------------------------------------------
     * KONSTANTA: konsentrasiOptions
     * Daftar pilihan konsentrasi parfum untuk dropdown form.
     * Didefinisikan di dalam komponen karena tidak berubah antar render.
     * ----------------------------------------------------------------------- */
    const konsentrasiOptions = [
        "Extrait de Parfum (Pure Perfume)",
        "Eau de Parfum (EDP)",
        "Eau de Toilette (EDT)",
        "Eau de Cologne (EDC)",
        "Eau Fraîche",
        "Eau de Senteur",
        "Splash & Aftershave"
    ];

    /* -----------------------------------------------------------------------
     * KONSTANTA: API_URL
     * URL endpoint API produk yang digunakan untuk semua operasi CRUD.
     * ----------------------------------------------------------------------- */
    const API_URL = BASE_URL + "/api/products";

    /* -----------------------------------------------------------------------
     * EFFECT: Inisialisasi Data
     * Memanggil fetchProducts satu kali saat komponen pertama kali dimuat.
     * ----------------------------------------------------------------------- */
    useEffect(() => {
        fetchProducts();
    }, []);

    /* -----------------------------------------------------------------------
     * FUNGSI: fetchProducts
     * Mengambil seluruh data produk dari API dan menyimpannya ke state.
     * ----------------------------------------------------------------------- */
    const fetchProducts = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    /* -----------------------------------------------------------------------
     * LOGIKA PAGINATION
     * Menghitung slice data produk yang ditampilkan berdasarkan halaman aktif.
     * ----------------------------------------------------------------------- */
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    /* -----------------------------------------------------------------------
     * FUNGSI: goToNextPage / goToPrevPage
     * Navigasi halaman tabel produk maju atau mundur satu halaman.
     * ----------------------------------------------------------------------- */
    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    /* -----------------------------------------------------------------------
     * FUNGSI: handleInputChange
     * Menangani perubahan nilai pada input teks dan select di form.
     * Field numerik (brand_id, harga_retail, stok_tersedia) dikonversi ke Number.
     * ----------------------------------------------------------------------- */
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedValue = ["brand_id", "harga_retail", "stok_tersedia"].includes(name)
            ? Number(value)
            : value;
        setFormData({ ...formData, [name]: updatedValue });
    };

    /* -----------------------------------------------------------------------
     * FUNGSI: handleQuillChange
     * Menangani perubahan konten pada editor rich text ReactQuill.
     * Menyimpan output HTML ke field deskripsi di formData.
     * ----------------------------------------------------------------------- */
    const handleQuillChange = (value: string) => {
        setFormData({ ...formData, deskripsi: value });
    };

    /* -----------------------------------------------------------------------
     * FUNGSI: handleFileChange
     * Menangani pemilihan file gambar dari input file.
     * Menyimpan objek File ke state imageFile untuk dikirim via FormData.
     * ----------------------------------------------------------------------- */
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setImageFile(e.target.files[0]);
    };

    /* -----------------------------------------------------------------------
     * FUNGSI: openCreateModal
     * Mereset semua field form ke nilai default dan membuka modal
     * dalam mode tambah produk baru (editingId = null).
     * ----------------------------------------------------------------------- */
    const openCreateModal = () => {
        setFormData({
            id: "", brand_id: 4, nama: "", harga_retail: 0, stok_tersedia: 0,
            ukuran: "50ml", konsentrasi: "Eau de Parfum (EDP)", vibe: "",
            deskripsi: "", gender: "Unisex", ketahanan: "", sillage: "",
            proyeksi: "2-3 Meter", status_stok: "Available Stock"
        });
        setImageFile(null);
        setEditingId(null);
        setIsModalOpen(true);
    };

    /* -----------------------------------------------------------------------
     * FUNGSI: openEditModal
     * Mengisi form dengan data produk yang dipilih dan membuka modal
     * dalam mode edit (editingId = ID produk yang dipilih).
     * @param product - Objek produk yang akan diedit
     * ----------------------------------------------------------------------- */
    const openEditModal = (product: Product) => {
        setFormData({
            id: product.id, brand_id: product.brand_id, nama: product.nama,
            harga_retail: Number(product.harga_retail), stok_tersedia: product.stok_tersedia,
            ukuran: product.ukuran || "", konsentrasi: product.konsentrasi || "",
            vibe: product.vibe || "", deskripsi: product.deskripsi || "",
            gender: product.gender || "", ketahanan: product.ketahanan || "",
            sillage: product.sillage || "", proyeksi: product.proyeksi || "2-3 Meter",
            status_stok: product.status_stok || "Available Stock"
        });
        setEditingId(product.id);
        setImageFile(null);
        setIsModalOpen(true);
    };

    /* -----------------------------------------------------------------------
     * FUNGSI: handleSubmit
     * Menangani submit form untuk tambah atau edit produk.
     * - Menggunakan FormData untuk mendukung upload file gambar
     * - Jika editingId ada → PUT ke endpoint /{id}, jika tidak → POST ke /products
     * - Menutup modal, refresh data, dan tampilkan toast setelah berhasil
     * ----------------------------------------------------------------------- */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value.toString());
        });
        if (imageFile) data.append("image", imageFile);

        const url = editingId ? `${API_URL}/${editingId}` : API_URL;

        try {
            const res = await fetch(url, { method: "POST", body: data });
            if (res.ok) {
                setIsModalOpen(false);
                fetchProducts();
                showSuccess(
                    editingId ? "Produk berhasil diperbarui!" : "Produk baru berhasil ditambahkan!",
                    editingId ? "update" : "create"
                );
            }
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    /* -----------------------------------------------------------------------
     * FUNGSI: handleDelete
     * Menghapus produk berdasarkan ID setelah konfirmasi browser.
     * Me-refresh data dan menampilkan toast setelah berhasil.
     * @param id - ID produk yang akan dihapus
     * ----------------------------------------------------------------------- */
    const handleDelete = async (id: string) => {
        if (!confirm(`Hapus produk ${id}?`)) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchProducts();
                showSuccess("Produk telah dihapus dari katalog.", "delete");
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    /* -----------------------------------------------------------------------
     * FUNGSI: showSuccess
     * Menampilkan toast notifikasi selama 3 detik setelah aksi berhasil.
     * @param message - Pesan yang ditampilkan di toast
     * @param type    - Tipe aksi: 'create' | 'update' | 'delete'
     * ----------------------------------------------------------------------- */
    const showSuccess = (message: string, type: string) => {
        setSuccessModal({ isOpen: true, message, type });
        setTimeout(() => {
            setSuccessModal(prev => ({ ...prev, isOpen: false }));
        }, 3000);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">

            {/* ===================================================================
             * SEKSI 1: TOAST NOTIFIKASI
             * Muncul di pojok kanan bawah layar selama 3 detik setelah aksi berhasil.
             * Ikon dan warna berbeda untuk aksi delete (merah) vs create/update (hijau).
             * =================================================================== */}
            {successModal.isOpen && (
                <div className="fixed bottom-10 right-10 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-2xl p-4 flex items-center gap-4 min-w-[320px] backdrop-blur-lg bg-white/90">
                        {/* Ikon aksi — merah untuk delete, hijau untuk create/update */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${successModal.type === 'delete' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                            {successModal.type === 'delete' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-1.816c0-1.107-.893-2.003-2.01-2.003h-2.23c-1.107 0-2.01.896-2.01 2.003V6" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900">Berhasil!</h4>
                            <p className="text-xs text-gray-500">{successModal.message}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">

                {/* ===================================================================
                 * SEKSI 2: HEADER HALAMAN
                 * Judul halaman inventori dan tombol untuk membuka modal tambah produk.
                 * =================================================================== */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Inventory Evomi</h1>
                    <button onClick={openCreateModal} className="bg-black text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all">
                        + Produk Baru
                    </button>
                </div>

                {/* ===================================================================
                 * SEKSI 3: TABEL DAFTAR PRODUK
                 * Menampilkan produk hasil pagination dengan kolom:
                 * - Produk  : thumbnail gambar, nama, dan SKU ID
                 * - Info    : ukuran dan konsentrasi
                 * - Harga   : harga retail dalam format Rupiah
                 * - Stok    : jumlah stok dengan badge warna (hijau/oranye)
                 * - Aksi    : tombol Edit dan Hapus
                 * Responsif: kolom header disembunyikan di mobile, baris ditampilkan
                 * sebagai block card di layar kecil.
                 * =================================================================== */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            {/* Kepala tabel — disembunyikan di mobile */}
                            <thead className="hidden md:table-header-group bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Produk</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Info</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Harga</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stok</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>

                            {/* Baris data produk */}
                            <tbody className="divide-y divide-gray-50 flex flex-col md:table-row-group">
                                {isLoading ? (
                                    /* State loading */
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center text-gray-400">Menghubungkan ke database...</td>
                                    </tr>
                                ) : currentProducts.length > 0 ? (
                                    currentProducts.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors flex flex-col md:table-row p-4 md:p-0">
                                            {/* Kolom Produk: thumbnail + nama + SKU */}
                                            <td className="px-0 py-2 md:px-6 md:py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                                                        {p.image_url ? <img src={p.image_url} alt={p.nama} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <div className="text-sm font-bold text-gray-900 truncate">{p.nama}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono tracking-tighter">{p.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Kolom Info: ukuran dan konsentrasi */}
                                            <td className="px-0 py-2 md:px-6 md:py-4">
                                                <div className="text-xs text-gray-600 font-medium">{p.ukuran} | {p.konsentrasi}</div>
                                            </td>
                                            {/* Kolom Harga */}
                                            <td className="px-0 py-2 md:px-6 md:py-4">
                                                <span className="text-sm font-bold text-stone-900">Rp {Number(p.harga_retail).toLocaleString('id-ID')}</span>
                                            </td>
                                            {/* Kolom Stok — badge hijau jika > 10, oranye jika <= 10 */}
                                            <td className="hidden md:table-cell px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.stok_tersedia > 10 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {p.stok_tersedia} Pcs
                                                </span>
                                            </td>
                                            {/* Kolom Aksi: tombol Edit dan Hapus */}
                                            <td className="px-0 py-4 md:px-6 md:py-4 border-t md:border-t-0 mt-2 md:mt-0 pt-4 md:pt-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button onClick={() => openEditModal(p)} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold">Edit</button>
                                                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 text-xs font-bold">Hapus</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    /* State kosong */
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center text-gray-400">Belum ada data produk.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* -----------------------------------------------------------------
                     * FOOTER PAGINATION
                     * Menampilkan info range produk yang ditampilkan dan tombol prev/next.
                     * Tombol dinonaktifkan saat sudah di halaman pertama atau terakhir.
                     * ----------------------------------------------------------------- */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-xs text-gray-500 font-medium">
                            Menampilkan <span className="text-black font-bold">{indexOfFirstItem + 1}</span> - <span className="text-black font-bold">{Math.min(indexOfLastItem, products.length)}</span> dari <span className="text-black font-bold">{products.length}</span> produk
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Tombol halaman sebelumnya */}
                            <button onClick={goToPrevPage} disabled={currentPage === 1} className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                            {/* Indikator halaman aktif */}
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-bold px-3 py-1 bg-black text-white rounded-md">{currentPage}</span>
                                <span className="text-xs text-gray-400 mx-1">dari</span>
                                <span className="text-xs font-bold text-gray-600">{totalPages || 1}</span>
                            </div>
                            {/* Tombol halaman berikutnya */}
                            <button onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ===================================================================
                 * SEKSI 4: MODAL FORM CRUD PRODUK
                 * Digunakan untuk tambah produk baru dan edit produk yang sudah ada.
                 * Form dibagi menjadi 3 kolom:
                 * - Kolom 1 : field dasar (SKU, nama, brand ID, harga, stok)
                 * - Kolom 2 : karakter produk (status stok, konsentrasi, ukuran, gender)
                 * - Kolom 3 : performa & media (ketahanan, sillage, proyeksi, gambar)
                 * - Full width: editor rich text deskripsi produk (ReactQuill)
                 * Judul dan tombol submit berubah dinamis sesuai mode (tambah/edit).
                 * =================================================================== */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 overflow-y-auto">
                        <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-gray-100 my-8 overflow-hidden">
                            <form onSubmit={handleSubmit}>

                                {/* Header modal — judul berubah sesuai mode */}
                                <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                                    <h2 className="text-xl font-bold">{editingId ? 'Update Parfum' : 'Tambah Koleksi Baru'}</h2>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
                                </div>

                                {/* Body form — 3 kolom + 1 full width */}
                                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">

                                    {/* ---------------------------------------------------------
                                     * KOLOM 1: Field Dasar & Numerik
                                     * SKU ID, nama parfum, brand ID, harga retail, stok tersedia
                                     * --------------------------------------------------------- */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">SKU ID (String)</label>
                                            <input name="id" value={formData.id} onChange={handleInputChange} disabled={!!editingId} className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black disabled:opacity-50" placeholder="e.g. EVO-001" required />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Nama Parfum (String)</label>
                                            <input name="nama" value={formData.nama} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black" required />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Brand ID (Number)</label>
                                            <input type="number" name="brand_id" value={formData.brand_id} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Harga (Number)</label>
                                                <input type="number" name="harga_retail" value={formData.harga_retail} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Stok (Number)</label>
                                                <input type="number" name="stok_tersedia" value={formData.stok_tersedia} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ---------------------------------------------------------
                                     * KOLOM 2: Karakter & Status Produk
                                     * Status stok, konsentrasi, ukuran, gender
                                     * --------------------------------------------------------- */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Status Stok</label>
                                            <select name="status_stok" value={formData.status_stok} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black appearance-none cursor-pointer">
                                                <option value="Available Stock">Available Stock</option>
                                                <option value="Low Stock">Low Stock</option>
                                                <option value="Out Of Stock">Out Of Stock</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Konsentrasi</label>
                                            <select name="konsentrasi" value={formData.konsentrasi} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black appearance-none cursor-pointer">
                                                {konsentrasiOptions.map((item) => (
                                                    <option key={item} value={item}>{item}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Ukuran</label>
                                                <input name="ukuran" value={formData.ukuran} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Gender</label>
                                            <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black">
                                                <option value="Unisex">Unisex</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* ---------------------------------------------------------
                                     * KOLOM 3: Performa & Media
                                     * Ketahanan, sillage, proyeksi, dan upload gambar produk
                                     * --------------------------------------------------------- */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Ketahanan (Longevity)</label>
                                            <input name="ketahanan" value={formData.ketahanan} onChange={handleInputChange} placeholder="e.g. 8-9 Jam" className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Sillage</label>
                                            <input name="sillage" value={formData.sillage} onChange={handleInputChange} placeholder="e.g. Strong" className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Proyeksi (Projection)</label>
                                            <input name="proyeksi" value={formData.proyeksi} onChange={handleInputChange} placeholder="e.g. 2-3 Meter" className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Gambar Produk</label>
                                            <input type="file" onChange={handleFileChange} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800" />
                                        </div>
                                    </div>

                                    {/* ---------------------------------------------------------
                                     * FULL WIDTH: Editor Deskripsi Rich Text
                                     * Menggunakan ReactQuill untuk input deskripsi produk
                                     * dalam format HTML yang akan disimpan ke database.
                                     * --------------------------------------------------------- */}
                                    <div className="md:col-span-3 space-y-2">
                                        <label className="block text-[10px] font-bold uppercase text-gray-400">Deskripsi Singkat (Rich Text)</label>
                                        <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                                            <ReactQuill theme="snow" value={formData.deskripsi} onChange={handleQuillChange} className="min-h-[150px]" />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer modal — tombol batal dan submit */}
                                <div className="px-8 py-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-gray-600">Batal</button>
                                    <button type="submit" className="px-8 py-2 bg-black text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all">
                                        {editingId ? 'Simpan Perubahan' : 'Publish Produk'}
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
