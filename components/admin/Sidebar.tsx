"use client";

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - Link        : navigasi antar halaman admin
 * - usePathname : mendeteksi path aktif untuk highlight menu yang sedang dibuka
 * - X & LogOut  : ikon tombol tutup sidebar (mobile) dan tombol logout
 * ========================================================================= */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LogOut } from "lucide-react";

/* =========================================================================
 * INTERFACE: SidebarProps
 * Mendefinisikan props yang diterima komponen Sidebar dari parent (AdminLayout).
 * - isOpen    : kontrol visibilitas sidebar di layar mobile
 * - onClose   : callback untuk menutup sidebar dari parent
 * - adminData : nama dan email admin untuk ditampilkan di footer sidebar mobile
 * - onLogout  : callback fungsi logout yang dieksekusi dari parent
 * ========================================================================= */
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  adminData: { name: string; email: string };
  onLogout: () => void;
}

/* =========================================================================
 * KOMPONEN UTAMA: Sidebar
 * Sidebar navigasi admin yang responsif.
 * - Desktop : selalu tampil (lg:translate-x-0), fixed di sisi kiri
 * - Mobile  : tersembunyi secara default, muncul saat isOpen = true
 * Fitur:
 * - Highlight otomatis menu aktif berdasarkan pathname saat ini
 * - Menutup sidebar otomatis setelah klik menu di layar mobile
 * - Footer khusus mobile: info admin + tombol logout
 * ========================================================================= */
export default function Sidebar({
  isOpen,
  onClose,
  adminData,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();

  /* -----------------------------------------------------------------------
   * DATA: menuItems
   * Array konfigurasi item menu navigasi sidebar.
   * Setiap item berisi nama, path tujuan, dan ikon SVG inline.
   * Urutan: Dashboard → Orders → Products → Articles → Messages → User Profile
   * ----------------------------------------------------------------------- */
  const menuItems = [
    /* Dashboard */
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    /* Orders */
    {
      name: "Orders",
      path: "/admin/orders",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
      ),
    },
    /* Products */
    {
      name: "Products",
      path: "/admin/products",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      ),
    },
    /* Articles */
    {
      name: "Articles",
      path: "/admin/artikel",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
        </svg>
      ),
    },
    /* Messages */
    {
      name: "Messages",
      path: "/admin/chat",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501c1.152-.086 2.294-.213 3.423-.379 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
      ),
    },
    /* User Profile */
    {
      name: "User Profile",
      path: "/admin/profile",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
    },
  ];

  return (
    /* =========================================================================
     * WRAPPER SIDEBAR
     * - Mobile  : tersembunyi (-translate-x-full), muncul saat isOpen = true
     * - Desktop : selalu tampil (lg:translate-x-0), fixed di sisi kiri layar
     * ========================================================================= */
    <aside
      className={`
        fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 
      `}
    >

      {/* =====================================================================
       * SEKSI 1: HEADER SIDEBAR
       * Logo Evomi (ikon kotak hitam + teks) dan tombol X untuk menutup
       * sidebar di layar mobile. Tombol X disembunyikan di desktop (lg:hidden).
       * ===================================================================== */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Ikon logo kotak hitam dengan inisial "E" */}
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">
            E
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            Evomi
          </span>
        </div>
        {/* Tombol tutup sidebar — hanya tampil di mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-stone-400 hover:bg-stone-100 rounded-lg"
        >
          <X size={20} />
        </button>
      </div>

      {/* =====================================================================
       * SEKSI 2: MENU NAVIGASI
       * Merender daftar menuItems secara dinamis.
       * - isActive ditentukan dengan mencocokkan pathname saat ini dengan path item
       *   (termasuk sub-path, misal /admin/orders/123 tetap highlight Orders)
       * - Item aktif: background hitam + teks putih
       * - Item tidak aktif: teks abu-abu, hover background abu-abu muda
       * - Di mobile: sidebar ditutup otomatis setelah klik menu
       * ===================================================================== */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <p className="px-4 text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-4">
          Main Menu
        </p>
        {menuItems.map((item) => {
          /* Cek apakah path saat ini cocok dengan item menu (exact atau sub-path) */
          const isActive =
            pathname === item.path || pathname.startsWith(`${item.path}/`);

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => {
                /* Tutup sidebar otomatis setelah klik menu di layar mobile */
                if (window.innerWidth < 1024) onClose();
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-black text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* =====================================================================
       * SEKSI 3: FOOTER SIDEBAR (MOBILE ONLY)
       * Hanya tampil di layar mobile (lg:hidden).
       * Menampilkan info admin (inisial, nama, status online) dan tombol logout.
       * Di desktop, info admin dan logout ditangani oleh topbar di AdminLayout.
       * ===================================================================== */}
      <div className="p-4 border-t border-gray-100 lg:hidden">

        {/* Kartu info admin */}
        <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100/50">
          {/* Avatar inisial nama admin */}
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            <div className="w-full h-full bg-black flex items-center justify-center text-white font-bold text-xs">
              {adminData.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-gray-900 truncate">
              {adminData.name || "Admin"}
            </p>
            <p className="text-[10px] text-green-500 font-medium">Online</p>
          </div>
        </div>

        {/* Tombol logout khusus mobile */}
        <div className="mt-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

    </aside>
  );
}
