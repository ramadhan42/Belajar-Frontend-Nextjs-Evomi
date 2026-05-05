"use client";

import { useEffect, useState } from "react"; // Import useEffect dan useState dari react
import { useRouter } from "next/navigation"; // Import useRouter dari next/navigation
import { LogOut, Menu } from "lucide-react"; // Pastikan lucide-react terinstall
import Sidebar from "@/components/admin/Sidebar"; // Sesuaikan path jika berbeda

// AdminLayout adalah komponen layout untuk halaman admin
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [adminData, setAdminData] = useState({ name: "Admin", email: "" });

    // 1. Proteksi Halaman & Fetch Data Admin
    useEffect(() => {
        const token = localStorage.getItem("admin_access_token");
        if (!token) {
            router.push("/admin/login");
            return;
        }

        // 2. Fetch Data Admin
        const fetchAdminMe = async () => {
            try {
                const res = await fetch("https://ramadhan.alwaysdata.net/api/admin/me", {
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

        // 3. Panggil fungsi fetchAdminMe
        fetchAdminMe();
    }, [router]);

    // 2. Fungsi Logout
    const handleLogout = async () => {
        const token = localStorage.getItem('admin_access_token');
        try {
            await fetch('https://ramadhan.alwaysdata.net/api/admin/logout', {
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

    // 3. Return JSX
    return (
        <div className="flex min-h-screen bg-[#F8F8F8]">

            {/* --- KOMPONEN SIDEBAR --- */}
            {/* Kita kirimkan state isOpen dan fungsi onClose ke Sidebar */}
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} adminData={adminData} onLogout={handleLogout} />

            {/* --- MAIN CONTENT AREA --- */}
            {/* Margin left (lg:ml-64) agar konten tidak tertutup sidebar di mode Desktop */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen transition-all duration-300">

                {/* --- MOBILE TOPBAR (Hanya Muncul di HP) --- */}
                <nav className="lg:hidden sticky top-0 z-30 bg-white border-b border-stone-200 px-4 h-16 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">E</div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">Evomi</span>
                    </div>
                    {/* Tombol Hamburger untuk membuka sidebar */}
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg">
                        <Menu size={24} />
                    </button>
                </nav>

                {/* --- DESKTOP TOPBAR (Hanya Muncul di Layar Besar) --- */}
                <nav className="hidden lg:flex sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-100 h-16 justify-between items-center px-8">
                    <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">Administrator Panel</p>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-stone-800 leading-none">{adminData.name}</p>
                            <p className="text-[10px] text-green-500 mt-1 uppercase tracking-tighter">● Online</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-white hover:bg-red-50 text-stone-600 hover:text-red-600 px-4 py-2 rounded-xl transition-all duration-200 font-medium text-sm border border-stone-100 shadow-sm"
                        >
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </nav>

                {/* --- PAGE CONTENT --- */}
                <main className="p-4 md:p-8 lg:p-12 flex-1">
                    {children}
                </main>
            </div>

            {/* --- OVERLAY GELAP (BACKDROP) --- */}
            {/* Muncul saat sidebar terbuka di HP. Jika diklik, sidebar tertutup */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}