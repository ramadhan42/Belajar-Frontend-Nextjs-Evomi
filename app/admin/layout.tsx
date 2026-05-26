"use client";

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - useEffect & useState : manajemen state dan lifecycle komponen
 * - useRouter            : navigasi programatik (redirect ke login jika tidak ada token)
 * - LogOut & Menu        : ikon untuk tombol logout dan hamburger menu mobile
 * - Sidebar              : komponen sidebar navigasi admin
 * - BASE_URL             : konstanta URL API global
 * ========================================================================= */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import Sidebar from "@/components/admin/Sidebar";
import { BASE_URL } from "@/src/config/strings";

/* =========================================================================
 * KOMPONEN UTAMA: AdminLayout
 * Layout wrapper untuk semua halaman di dalam /admin.
 * Bertanggung jawab atas:
 * - Proteksi rute: redirect ke /admin-login jika token tidak ditemukan
 * - Fetch data admin yang sedang login untuk ditampilkan di topbar
 * - Sidebar navigasi (desktop: selalu tampil, mobile: toggle via hamburger)
 * - Topbar mobile dan desktop dengan info admin dan tombol logout
 * - Overlay backdrop saat sidebar mobile terbuka
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
     * 3. Simpan nama dan email admin ke state adminData untuk ditampilkan di topbar
     * ----------------------------------------------------------------------- */
    useEffect(() => {
        const token = localStorage.getItem("admin_access_token");

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
     * - Redirect ke halaman /admin-login
     * ----------------------------------------------------------------------- */
    const handleLogout = async () => {
        const token = localStorage.getItem('admin_access_token');
        try {
            await fetch(BASE_URL + '/api/admin/logout', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error("Gagal logout:", error);
        } finally {
            localStorage.removeItem('admin_access_token');
            router.push('/admin-login');
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F8F8F8]">

            {/* ===================================================================
             * SEKSI 1: SIDEBAR NAVIGASI
             * Komponen Sidebar menerima:
             * - isOpen    : state visibilitas sidebar di mobile
             * - onClose   : fungsi untuk menutup sidebar mobile
             * - adminData : nama dan email admin untuk ditampilkan di sidebar
             * - onLogout  : fungsi logout yang dipanggil dari dalam sidebar
             * =================================================================== */}
            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                adminData={adminData}
                onLogout={handleLogout}
            />

            {/* ===================================================================
             * SEKSI 2: AREA KONTEN UTAMA
             * Menggunakan margin kiri (lg:ml-64) agar konten tidak tertutup
             * oleh sidebar yang memiliki lebar 64 di mode desktop.
             * =================================================================== */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen transition-all duration-300">

                {/* ---------------------------------------------------------------
                 * TOPBAR MOBILE
                 * Hanya tampil di layar kecil (lg:hidden).
                 * Menampilkan logo Evomi dan tombol hamburger untuk membuka sidebar.
                 * --------------------------------------------------------------- */}
                <nav className="lg:hidden sticky top-0 z-30 bg-white border-b border-stone-200 px-4 h-16 flex justify-between items-center shadow-sm">
                    {/* Logo Evomi */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">E</div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">Evomi</span>
                    </div>
                    {/* Tombol hamburger — membuka sidebar mobile */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                </nav>

                {/* ---------------------------------------------------------------
                 * TOPBAR DESKTOP
                 * Hanya tampil di layar besar (hidden lg:flex).
                 * Menampilkan label panel, nama admin, status online, dan tombol logout.
                 * --------------------------------------------------------------- */}
                <nav className="hidden lg:flex sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-100 h-16 justify-between items-center px-8">
                    {/* Label panel kiri */}
                    <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">Administrator Panel</p>

                    {/* Info admin dan tombol logout kanan */}
                    <div className="flex items-center gap-6">
                        {/* Nama admin dan indikator status online */}
                        <div className="text-right">
                            <p className="text-sm font-semibold text-stone-800 leading-none">{adminData.name}</p>
                            <p className="text-[10px] text-green-500 mt-1 uppercase tracking-tighter">● Online</p>
                        </div>
                        {/* Tombol logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-white hover:bg-red-50 text-stone-600 hover:text-red-600 px-4 py-2 rounded-xl transition-all duration-200 font-medium text-sm border border-stone-100 shadow-sm"
                        >
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </nav>

                {/* ---------------------------------------------------------------
                 * KONTEN HALAMAN
                 * Slot {children} — diisi oleh halaman aktif di dalam /admin.
                 * --------------------------------------------------------------- */}
                <main className="p-4 md:p-8 lg:p-12 flex-1">
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
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
