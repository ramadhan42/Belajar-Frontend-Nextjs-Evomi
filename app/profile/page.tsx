"use client";

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - motion, AnimatePresence, Variants : animasi halaman dan modal (Framer Motion)
 * - useState & useEffect : manajemen state dan lifecycle
 * - ShoppingBag          : komponen keranjang belanja user
 * - useRouter            : navigasi programatik (redirect ke login jika belum auth)
 * - localFont            : mendaftarkan font lokal brand Evomi
 * - Image & Link         : komponen Next.js untuk gambar dan navigasi
 * - BASE_URL             : konstanta URL API global
 * - WavyNavbarGradient   : dekorasi gelombang di bawah navbar
 * ========================================================================= */
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState, useEffect } from "react";
import ShoppingBag from "@/components/ShoppingBag";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";
import Image from "next/image";
import Link from "next/link";
import { BASE_URL } from "@/src/config/strings";
import WavyNavbarGradient from "@/components/WavyNavbarGradient";

/* =========================================================================
 * ANIMASI VARIANTS
 * - fadeInUp        : elemen muncul dari bawah ke atas dengan fade
 * - staggerContainer: wrapper yang men-stagger animasi anak-anaknya
 * ========================================================================= */
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

/* =========================================================================
 * KONFIGURASI FONT LOKAL
 * - fontJudul   : font brand berat untuk heading
 * - fontCaption : font body reguler untuk teks paragraf
 * ========================================================================= */
const fontJudul = localFont({
  src: "../fonts/8 Heavy.ttf",
  variable: "--font-brand",
  display: "swap",
});

const fontCaption = localFont({
  src: "../fonts/Nohemi-Regular.otf",
  variable: "--font-body",
  display: "swap",
});

/* =========================================================================
 * KOMPONEN UTAMA: LuxuryProfilePage
 * Halaman profil user dengan desain luxury minimal.
 * Fitur:
 * - Sidebar kiri: foto profil, nama, username, tab navigasi
 * - Panel kanan: konten tab aktif (Shopping Bag atau Account Details)
 * - Modal "Refine Identity": edit nama, username, foto, dan password
 * - Manajemen status online/offline via Beacon API
 * - Redirect ke /login jika token tidak ditemukan
 * ========================================================================= */
export default function LuxuryProfilePage() {

  /* -----------------------------------------------------------------------
   * STATE: formData
   * Menyimpan semua nilai field form edit profil.
   * - image : objek File untuk upload foto baru (null jika tidak diubah)
   * ----------------------------------------------------------------------- */
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    username: '',
    email: '',
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
    image: null as File | null,
  });

  /* -----------------------------------------------------------------------
   * STATE TAMBAHAN
   * - imagePreview  : URL object lokal untuk preview foto sebelum diupload
   * - isModalOpen   : kontrol visibilitas modal edit profil
   * - loading       : indikator loading saat submit form edit profil
   * - statusMessage : pesan sukses/error setelah submit form
   * - user          : data user yang sedang login
   * - activeTab     : tab aktif di panel kanan ('cart' | 'identity')
   * - mounted       : flag hydration untuk mencegah mismatch SSR/CSR
   * ----------------------------------------------------------------------- */
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null, text: string }>({ type: null, text: "" });
  const [user, setUser] = useState<{ id: string; name: string; username: string; email: string; image?: string; } | null>(null);
  const [activeTab, setActiveTab] = useState("cart");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  /* -----------------------------------------------------------------------
   * EFFECT: Manajemen Status Online/Offline
   * - Set status online (1) saat halaman dibuka
   * - Set status offline (0) via Beacon API saat tab/browser ditutup
   *   atau saat user berpindah halaman (unmount)
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    if (!user) return;

    const setOnlineStatus = async () => {
      try {
        const token = localStorage.getItem("access_token");
        await fetch(`${BASE_URL}/api/user/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ is_online: 1 })
        });
      } catch (err) {
        console.error("Gagal update status online:", err);
      }
    };

    setOnlineStatus();

    const handleOfflineBeacon = () => {
      const url = `${BASE_URL}/api/user/status-beacon`;
      const data = JSON.stringify({ user_id: user.id, is_online: 0 });
      const blob = new Blob([data], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    };

    window.addEventListener('beforeunload', handleOfflineBeacon);
    return () => {
      handleOfflineBeacon(); // Set offline saat pindah halaman
      window.removeEventListener('beforeunload', handleOfflineBeacon);
    };
  }, [user]);

  /* -----------------------------------------------------------------------
   * EFFECT: Inisialisasi Data User
   * - Set mounted = true untuk menghindari hydration mismatch
   * - Cek token di localStorage — redirect ke /login jika tidak ada
   * - Fetch data user terbaru dari API /api/user
   * - Jika 401: panggil handleLogout
   * - Jika fetch gagal: gunakan data user dari localStorage sebagai fallback
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    setMounted(true);

    const fetchUserData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(BASE_URL + "/api/user", {
          method: "GET",
          headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setFormData(prev => ({
            ...prev,
            id: userData.id,
            name: userData.name,
            username: userData.username,
            email: userData.email
          }));
          localStorage.setItem("user_data", JSON.stringify(userData));
        } else if (response.status === 401) {
          handleLogout();
        }
      } catch (error) {
        // Fallback ke data localStorage jika fetch gagal
        const savedUser = localStorage.getItem("user_data");
        if (savedUser) setUser(JSON.parse(savedUser));
      }
    };
    fetchUserData();
  }, [router]);

  /* -----------------------------------------------------------------------
   * FUNGSI: handleLogout
   * Menghapus token dan data user dari localStorage, lalu redirect ke /.
   * ----------------------------------------------------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    router.push("/");
    router.refresh();
  };

  /* -----------------------------------------------------------------------
   * FUNGSI: handleImageChange
   * Menangani pemilihan foto profil baru dari input file.
   * - Simpan File ke formData.image untuk dikirim via FormData
   * - Buat URL object lokal untuk preview sebelum upload
   * ----------------------------------------------------------------------- */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  /* -----------------------------------------------------------------------
   * FUNGSI: closeModal
   * Menutup modal edit profil dan mereset semua field password,
   * preview gambar, dan pesan status.
   * ----------------------------------------------------------------------- */
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(prev => ({ ...prev, current_password: '', new_password: '', new_password_confirmation: '', image: null }));
    setImagePreview(null);
    setStatusMessage({ type: null, text: "" });
  };

  /* -----------------------------------------------------------------------
   * FUNGSI: handleSubmit
   * Menangani submit form edit profil.
   * - Menggunakan FormData + _method: 'PUT' (Laravel method spoofing)
   * - Password hanya dikirim jika current_password diisi
   * - Gambar hanya dikirim jika ada file baru yang dipilih
   * - Update state user dan localStorage setelah berhasil
   * - Tutup modal otomatis setelah 2 detik jika sukses
   * ----------------------------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
    const data = new FormData();
    data.append('_method', 'PUT');
    data.append('name', formData.name);
    data.append('username', formData.username);
    if (formData.image) data.append('image', formData.image);
    if (formData.current_password) {
      data.append('current_password', formData.current_password);
      data.append('new_password', formData.new_password);
      data.append('new_password_confirmation', formData.new_password_confirmation);
    }

    try {
      const response = await fetch(BASE_URL + `/api/users/${formData.id}`, {
        method: "POST",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
        body: data,
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.data || updatedUser);
        localStorage.setItem("user_data", JSON.stringify(updatedUser.data || updatedUser));
        setStatusMessage({ type: 'success', text: "Identity successfully refined." });
        setTimeout(closeModal, 2000); // Tutup modal otomatis setelah 2 detik
      } else {
        const errorData = await response.json();
        setStatusMessage({ type: 'error', text: errorData.message || "Failed to update profile." });
      }
    } catch (error) {
      setStatusMessage({ type: 'error', text: "Connection failed." });
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------------------------------------------------
   * LOADING / AUTH STATE
   * Tampilkan animasi loading saat data belum siap atau user belum terload.
   * ----------------------------------------------------------------------- */
  if (!mounted || !user) return (
    <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center">
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-[10px] uppercase tracking-[0.5em] text-stone-400 font-bold"
      >
        Loading Profile...
      </motion.div>
    </div>
  );

  return (
    <div className={`${fontCaption.variable} ${fontJudul.variable} min-h-screen bg-[#FBFBF9] font-sans text-stone-900 selection:bg-amber-200/50 antialiased`}>

      {/* ===================================================================
       * NAVBAR FIXED
       * Logo Evomi (kiri) dan tombol Sign Out (kanan).
       * =================================================================== */}
      <nav className="fixed w-full z-[100] bg-[#0071bc] backdrop-blur-xl border-b border-white/5 shadow-sm px-8 h-20 flex items-center justify-between">
        <WavyNavbarGradient />
        <Link href="/" className="hover:opacity-70 transition-opacity">
          <Image src="/img/Logo Evomi.png" alt="Evomi" width={80} height={30} className="brightness-0 invert" />
        </Link>
        <div className="flex items-center space-x-8">
          <button onClick={handleLogout} className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 hover:text-amber-200 transition-colors">
            Sign Out
          </button>
        </div>
      </nav>

      {/* ===================================================================
       * AMBIENT BACKGROUND
       * Dua lingkaran blur animasi sebagai aksen visual latar belakang.
       * Kiri atas: abu-abu, kanan bawah: amber.
       * =================================================================== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 2 }} className="absolute top-20 left-10 w-[30rem] h-[30rem] bg-stone-200/40 rounded-full blur-[100px]" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 2, delay: 0.5 }} className="absolute bottom-20 right-10 w-[30rem] h-[30rem] bg-amber-100/30 rounded-full blur-[100px]" />
      </div>

      {/* ===================================================================
       * LAYOUT UTAMA (GRID 2 KOLOM)
       * - Kolom kiri (4/12)  : sidebar identitas user (sticky)
       * - Kolom kanan (8/12) : panel konten tab aktif
       * =================================================================== */}
      <main className="relative pt-36 pb-20 px-6 md:px-12 max-w-7xl mx-auto grid md:grid-cols-12 gap-12 lg:gap-20">

        {/* -----------------------------------------------------------------
         * SIDEBAR KIRI: IDENTITAS USER
         * Sticky di posisi top-36 saat scroll.
         * Berisi: foto profil, nama, username, divider, tab navigasi.
         * ----------------------------------------------------------------- */}
        <div className="md:col-span-4">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-10 sticky top-36">

            {/* Foto profil — fallback ke inisial nama jika default-avatar */}
            <motion.div variants={fadeInUp} className="relative group w-32 h-40">
              <div className="w-full h-full bg-stone-100 rounded-[2.5rem] overflow-hidden border border-stone-200 shadow-sm transition-transform duration-700 group-hover:scale-[1.02]">
                {user.image && user.image !== 'default-avatar.png' ? (
                  <Image src={`https://ramadhan.alwaysdata.net/storage/profiles/${user.image}`} alt="Profile" fill className="object-cover" unoptimized />
                ) : (
                  <div className="absolute inset-0 bg-stone-800 flex items-center justify-center text-3xl text-white uppercase font-light">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Nama dan username */}
            <motion.div variants={fadeInUp} className="space-y-2">
              <h2 className={`${fontJudul.className} text-3xl uppercase tracking-tighter text-stone-900`}>{user.name}</h2>
              <p className="text-stone-400 text-xs tracking-widest uppercase font-medium">@{user.username}</p>
            </motion.div>

            {/* Divider dekoratif */}
            <motion.div variants={fadeInUp} className="h-[1px] bg-stone-200 w-12" />

            {/* Tab navigasi: Shopping Bag dan Account Details */}
            <motion.div variants={fadeInUp} className="flex flex-col space-y-5">
              {[
                { id: "cart", label: "Shopping Bag" },
                { id: "identity", label: "Account Details" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`text-left text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-500 ${activeTab === item.id ? "text-stone-900 translate-x-2" : "text-stone-300 hover:text-stone-500"}`}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* -----------------------------------------------------------------
         * PANEL KANAN: KONTEN TAB AKTIF
         * Animasi fade + slide saat berganti tab.
         * - Tab 'cart'     : komponen ShoppingBag
         * - Tab 'identity' : detail akun + tombol "Modify Identity"
         * ----------------------------------------------------------------- */}
        <div className="md:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-stone-100 min-h-[550px]"
            >
              {activeTab === "cart" ? (
                /* Tab Shopping Bag */
                <div className="space-y-8">
                  <h3 className={`${fontJudul.className} text-xl uppercase tracking-widest text-stone-800 border-b border-stone-50 pb-6`}>Current Bag</h3>
                  <ShoppingBag />
                </div>
              ) : (
                /* Tab Account Details */
                <div className="space-y-12">
                  <h3 className={`${fontJudul.className} text-xl uppercase tracking-widest text-stone-800`}>Identity Details</h3>
                  <div className="grid md:grid-cols-2 gap-12">
                    <DetailItem label="Full Name" value={user.name} />
                    <DetailItem label="Email Address" value={user.email} />
                    <DetailItem label="Username" value={`@${user.username}`} />
                    <DetailItem label="Tier Status" value="Evomi Collector" />
                  </div>
                  <div className="pt-8">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-stone-900 text-white px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 hover:-translate-y-1 transition-all shadow-lg shadow-stone-200"
                    >
                      Modify Identity
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ===================================================================
       * MODAL: REFINE IDENTITY (EDIT PROFIL)
       * Muncul saat tombol "Modify Identity" ditekan.
       * Berisi form edit: foto, nama, username, dan update password.
       * Backdrop blur + klik backdrop untuk tutup modal.
       * =================================================================== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            {/* Backdrop — klik untuk tutup modal */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm" />

            {/* Konten modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-10 md:p-14 shadow-2xl overflow-hidden border border-stone-100"
            >
              <div className="space-y-8">
                {/* Header modal */}
                <div>
                  <h3 className={`${fontJudul.className} text-2xl uppercase tracking-tighter mb-1`}>Refine Identity</h3>
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest">Digital Presence Maintenance</p>
                </div>

                {/* Notifikasi status sukses/error */}
                {statusMessage.text && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={`p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
                  >
                    {statusMessage.text}
                  </motion.div>
                )}

                {/* Form edit profil */}
                <form className="space-y-6 max-h-[60vh] overflow-y-auto pr-2" onSubmit={handleSubmit}>

                  {/* Upload foto profil dengan preview hover */}
                  <div className="flex flex-col items-center space-y-4 pb-4">
                    <div className="relative group w-24 h-24">
                      <div className="w-full h-full bg-stone-50 rounded-[1.5rem] overflow-hidden border-2 border-dashed border-stone-200 flex items-center justify-center transition-all group-hover:border-stone-400">
                        {(imagePreview || (user.image && user.image !== 'default-avatar.png')) ? (
                          <img src={imagePreview || `https://ramadhan.alwaysdata.net/storage/profiles/${user.image}`} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <span className="text-[8px] text-stone-300 font-bold uppercase tracking-widest">No Portrait</span>
                        )}
                      </div>
                      {/* Overlay "Change" saat hover */}
                      <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-stone-900/40 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-all">
                        <span className="text-[8px] text-white font-black uppercase tracking-widest">Change</span>
                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                      </label>
                    </div>
                  </div>

                  {/* Field nama dan username */}
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Full Name" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} />
                    <InputGroup label="Username" value={formData.username} onChange={(v: string) => setFormData({ ...formData, username: v })} />
                  </div>

                  {/* Section update password */}
                  <div className="space-y-4 pt-4 border-t border-stone-100">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Security Update</p>
                    <InputGroup label="Current Password" type="password" value={formData.current_password} onChange={(v: string) => setFormData({ ...formData, current_password: v })} placeholder="••••••••" />
                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup label="New Password" type="password" value={formData.new_password} onChange={(v: string) => setFormData({ ...formData, new_password: v })} placeholder="Secret" />
                      <InputGroup label="Confirm New" type="password" value={formData.new_password_confirmation} onChange={(v: string) => setFormData({ ...formData, new_password_confirmation: v })} placeholder="Repeat" />
                    </div>
                  </div>

                  {/* Tombol aksi modal */}
                  <div className="pt-6 flex gap-3">
                    <button type="button" onClick={closeModal} className="flex-1 px-6 py-4 rounded-xl text-[9px] uppercase tracking-widest font-bold text-stone-400 hover:bg-stone-50 transition-all">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-[2] bg-stone-900 text-white px-6 py-4 rounded-xl text-[9px] uppercase tracking-widest font-bold hover:bg-stone-800 transition-all disabled:opacity-50">
                      {loading ? "Refining..." : "Save Refinements"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================================
 * KOMPONEN HELPER: DetailItem
 * Menampilkan satu baris informasi akun dengan label dan nilai.
 * Digunakan di tab "Account Details".
 * ========================================================================= */
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-stone-300">{label}</label>
      <p className="text-base font-light text-stone-800 border-b border-stone-50 pb-2">{value}</p>
    </div>
  );
}

/* =========================================================================
 * KOMPONEN HELPER: InputGroup
 * Input field dengan label untuk digunakan di dalam form modal.
 * Menerima value, onChange callback, type, dan placeholder sebagai props.
 * ========================================================================= */
function InputGroup({ label, value, onChange, type = "text", placeholder = "" }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[8px] uppercase tracking-[0.3em] font-bold text-stone-400 ml-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-stone-50 border-none rounded-xl px-5 py-3.5 text-xs focus:ring-1 focus:ring-stone-200 outline-none transition-all placeholder:text-stone-300"
      />
    </div>
  );
}
