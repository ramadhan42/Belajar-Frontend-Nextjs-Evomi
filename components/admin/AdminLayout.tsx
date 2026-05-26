"use client";

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - useEffect & useState : manajemen state dan lifecycle komponen
 * - useRouter            : navigasi programatik (redirect ke login jika tidak ada token)
 * - Lucide Icons         : ikon untuk tombol logout, hamburger, tutup sidebar
 * - Link                 : navigasi antar halaman admin di sidebar
 * - BASE_URL             : konstanta URL API global
 * ========================================================================= */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { BASE_URL } from "@/src/config/strings";

/* =========================================================================
 * KOMPONEN UTAMA: AdminLayout
 * Layout wrapper alternatif untuk panel admin (versi komponen reusable).
 * Bertanggung jawab atas:
 * - Proteksi rute: redirect ke /admin/login jika token tidak ditemukan
 * - Fetch data admin yang sedang login untuk ditampilkan di navbar
 * - Sidebar navigasi (desktop: fixed, mobile: toggle via hamburger)
 * - Sticky navbar dengan info admin dan tombol logout
 * - Overlay backdrop saat sidebar mobile terbuka
 *
 * Catatan: Komponen ini menggunakan key 'admin_token' di localStorage,
 * berbeda dengan app/admin/layout.tsx yang menggunakan 'admin_access_token'.
 * ========================================================================= */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    /* -----------------------------------------------------------------------
     * STATE
     * - isMobileMenuOpen : kontrol visibilitas sidebar di layar mobile
     * - adminData        : nama dan email admin yang sedang login
     * ----------------------------------------------------------------------- */
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [adminData, setAdminData] = useState({ name: "Admin", email: "" });

    /* -----------------------------------------------------------------------
     * EFFECT: Proteksi Rute & Fetch Data Admin
     * Dijalankan sekali saat layout pertama kali dimuat.
     * 1. Cek keberadaan token di localStorage — redirect ke login jika tidak ada
     * 2. Fetch data profil admin yang sedang login dari API /admin/me
     * 3. Simpan nama dan email admin ke state adminData untuk ditampilkan di navbar
     * ----------------------------------------------------------------------- */
    useEffect(() => {
        const token = localStorage.getItem("admin_token");

        // Redirect ke halaman login jika token tidak ditemukan
        if (!token) {
            router.push("/admin/login");
            return;
        }

        /* -------------------------------------------------------------------
         * FUNGSI INNER: fetchAdminMe
         * Mengambil data profil admin yang sedang login dari API.
         * Dipanggil langsung di dalam effect setelah validasi token.
         * ------------------------------------------------------------------- */
        const fetchAdminMe = async () => {
            try {
                const res = await fetch(BASE_URL + "/api/admin/me", {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                const result = await res.json();
                if (result.success) {
                    setAdminData({ name: result.data.name, email: result.data.email });
                }
            } catch (err) {
                console.error("Gagal mengambil data admin:", err);
            }
        };

        fetchAdminMe();
    }, [router]);

    /* -----------------------------------------------------------------------
     * FUNGSI: handleLogout
     * Menangani proses logout admin.
     * - Memanggil API logout untuk invalidasi token di server
     * - Menghapus token dari localStorage
     * - Redirect ke halaman /admin/login
     * ----------------------------------------------------------------------- */
    const handleLogout = async () => {
        const token = localStorage.getItem('admin_token');
        try {
            await fetch(BASE_URL + '/api/admin/logout', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error("Gagal koneksi ke server untuk logout:", error);
        } finally {
            localStorage.removeItem('admin_token');
            router.push('/admin/login');
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F8F8F8]">

            {/* ===================================================================
             * SEKSI 1: SIDEBAR NAVIGASI
             * - Mobile  : tersembunyi secara default (-translate-x-full),
             *             muncul saat isMobileMenuOpen = true (translate-x-0)
             * - Desktop : selalu tampil (lg:translate-x-0), fixed di sisi kiri
             * Berisi logo Evomi, divider, dan menu navigasi utama.
             * =================================================================== */}
            <aside className={`
                w-72 bg-white border-r border-stone-100 p-10 fixed h-full z-50 transition-transform duration-300
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
                lg:translate-x-0
            `}>
                {/* Header sidebar: logo + tombol tutup (mobile only) */}
                <div className="mb-16 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-light tracking-[0.5em] uppercase text-black">Evomi</h2>
                        <div className="h-[1px] w-10 bg-black mt-4"></div>
                    </div>
                    {/* Tombol X untuk menutup sidebar di mobile */}
                    <button className="lg:hidden p-2 text-stone-400" onClick={() => setIsMobileMenuOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                {/* Menu navigasi sidebar */}
                <nav className="space-y-8">
                    <div className="space-y-4">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-stone-300 font-bold">Main Menu</p>
                        <ul className="space-y-2">
                            <Link href="/admin/dashboard" className="block text-[11px] uppercase tracking-widest text-black font-medium hover:translate-x-1 transition-transform">Dashboard</Link>
                            <Link href="/admin/products" className="block text-[11px] uppercase tracking-widest text-stone-400 hover:text-black transition-all">Products</Link>
                            <Link href="/admin/orders" className="block text-[11px] uppercase tracking-widest text-stone-400 hover:text-black transition-all">Orders</Link>
                        </ul>
                    </div>
                </nav>
            </aside>

            {/* ===================================================================
             * SEKSI 2: AREA KONTEN UTAMA
             * Menggunakan margin kiri (lg:ml-72) agar konten tidak tertutup
             * oleh sidebar yang memiliki lebar 72 di mode desktop.
             * =================================================================== */}
            <div className="flex-1 lg:ml-72 flex flex-col">

                {/* ---------------------------------------------------------------
                 * STICKY NAVBAR
                 * Selalu tampil di semua ukuran layar.
                 * - Mobile  : tombol hamburger untuk membuka sidebar
                 * - Desktop : label "Administrator Panel"
                 * - Kanan   : nama admin, status online, dan tombol logout
                 * --------------------------------------------------------------- */}
                <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-100">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">

                        {/* Tombol hamburger — hanya tampil di mobile */}
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-stone-600">
                            <Menu size={20} />
                        </button>

                        {/* Label panel — hanya tampil di desktop */}
                        <div className="hidden lg:block">
                            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">Administrator Panel</p>
                        </div>

                        {/* Info admin dan tombol logout */}
                        <div className="flex items-center gap-6">
                            {/* Nama admin dan indikator status online — disembunyikan di layar sangat kecil */}
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-stone-800 leading-none">{adminData.name}</p>
                                <p className="text-[10px] text-green-500 mt-1 uppercase tracking-tighter">● Online</p>
                            </div>

                            {/* Tombol logout */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 bg-white hover:bg-red-50 text-stone-600 hover:text-red-600 px-4 py-2 rounded-xl transition-all duration-200 font-medium text-sm border border-stone-100 hover:border-red-100 shadow-sm"
                            >
                                <LogOut size={16} />
                                {/* Teks "Logout" disembunyikan di layar sangat kecil */}
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </nav>

                {/* ---------------------------------------------------------------
                 * KONTEN HALAMAN
                 * Slot {children} — diisi oleh halaman aktif di dalam /admin.
                 * --------------------------------------------------------------- */}
                <main className="p-8 lg:p-12">
                    {children}
                </main>
            </div>

            {/* ===================================================================
             * SEKSI 3: OVERLAY BACKDROP MOBILE
             * Muncul di belakang sidebar saat sidebar mobile terbuka.
             * Mengklik overlay akan menutup sidebar.
             * Hanya aktif di layar kecil (lg:hidden).
             * =================================================================== */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
