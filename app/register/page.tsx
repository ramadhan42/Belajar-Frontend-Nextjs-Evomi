"use client";

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - useState       : manajemen state form, loading, dan error
 * - useRouter      : navigasi ke halaman utama setelah registrasi berhasil
 * - Link           : navigasi ke halaman login dan beranda
 * - motion         : animasi fade-in kartu form (Framer Motion)
 * - Lucide Icons   : ikon untuk field input dan tombol aksi
 * - BASE_URL       : konstanta URL API global
 * ========================================================================= */
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, User, Mail, AtSign, Loader2, ArrowLeft } from "lucide-react";
import { BASE_URL } from "@/src/config/strings";

/* =========================================================================
 * KOMPONEN UTAMA: RegisterPage
 * Halaman registrasi akun baru untuk user Evomi.
 * Fitur:
 * - Form 5 field: nama, username, email, password, konfirmasi password
 * - Kirim data ke API Laravel /api/register via POST
 * - Simpan access_token dan user_data ke localStorage setelah berhasil
 * - Redirect ke halaman utama (/) setelah registrasi sukses
 * - Tampilkan pesan error inline dari API jika registrasi gagal
 * - Username otomatis dikonversi ke lowercase tanpa spasi
 * ========================================================================= */
export default function RegisterPage() {
  const router = useRouter();

  /* -----------------------------------------------------------------------
   * STATE: formData
   * Menyimpan semua nilai input form registrasi.
   * Sesuai dengan struktur data yang diharapkan oleh API Laravel.
   * ----------------------------------------------------------------------- */
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  /* -----------------------------------------------------------------------
   * STATE: loading & error
   * - loading : indikator loading saat request registrasi sedang berjalan
   * - error   : pesan error dari API yang ditampilkan di atas form
   * ----------------------------------------------------------------------- */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* -----------------------------------------------------------------------
   * FUNGSI: handleSubmit
   * Menangani submit form registrasi.
   * Alur:
   * 1. Reset error dan set loading
   * 2. Kirim formData ke API Laravel /api/register via POST
   * 3. Jika berhasil: simpan token + user ke localStorage, redirect ke /
   * 4. Jika gagal: tampilkan pesan error dari response API
   * ----------------------------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(BASE_URL + "/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Tangani error validasi atau error server dari API Laravel
        throw new Error(data.message || "Registrasi gagal.");
      }

      // Simpan token autentikasi ke localStorage
      localStorage.setItem("access_token", data.access_token);

      // Simpan data user ke localStorage sesuai struktur response API
      localStorage.setItem("user_data", JSON.stringify(data.user));

      router.push("/");

      // Refresh dengan delay kecil untuk memperbarui state auth di komponen lain
      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12">

      {/* ===================================================================
       * DEKORASI BACKGROUND
       * Dua lingkaran blur di sudut kanan atas dan kiri bawah
       * sebagai aksen visual lembut di belakang kartu form.
       * =================================================================== */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] bg-slate-100 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-blue-50/50 rounded-full blur-[100px]" />
      </div>

      {/* ===================================================================
       * TOMBOL KEMBALI KE BERANDA
       * Link dengan ikon panah kiri di pojok kiri atas halaman.
       * Ikon bergerak ke kiri saat hover.
       * =================================================================== */}
      <Link
        href="/"
        className="absolute top-8 left-8 z-50 flex items-center space-x-2 text-slate-400 hover:text-slate-900 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
          Back to Home
        </span>
      </Link>

      {/* ===================================================================
       * KARTU FORM REGISTRASI
       * Animasi fade-in + slide-up saat halaman dimuat.
       * =================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg z-10"
      >
        <div className="bg-white border border-slate-200 p-10 shadow-[0_8px_40px_rgba(0,0,0,0.03)] rounded-[2.5rem]">

          {/* ---------------------------------------------------------------
           * HEADER KARTU
           * Judul "Join the community" + nama brand Evomi + garis dekoratif.
           * --------------------------------------------------------------- */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
              Join the community <br />
              <span className="italic uppercase tracking-tighter font-black text-slate-800">Evomi</span>
            </h2>
            <div className="h-1 w-8 bg-slate-900 mx-auto mt-4 rounded-full" />
          </div>

          {/* ---------------------------------------------------------------
           * ALERT ERROR
           * Hanya tampil jika state error tidak kosong.
           * Menampilkan pesan error dari API atau pesan default.
           * --------------------------------------------------------------- */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl text-center uppercase tracking-wide">
              {error}
            </div>
          )}

          {/* ---------------------------------------------------------------
           * FORM REGISTRASI
           * Layout grid 2 kolom untuk nama & username, dan password & konfirmasi.
           * Email full width di tengah.
           * --------------------------------------------------------------- */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Baris 1: Nama Lengkap + Username (2 kolom) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Input Full Name */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all text-sm text-slate-900"
                    placeholder="Full Name"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Input Username — otomatis lowercase tanpa spasi */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Username</label>
                <div className="relative group">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all text-sm text-slate-900"
                    placeholder="Username"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value.toLowerCase().replace(/\s/g, ""),
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Input Email Address (full width) */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all text-sm text-slate-900"
                  placeholder="email@customer.com"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Baris 3: Password + Konfirmasi Password (2 kolom) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Input Password */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all text-sm text-slate-900"
                    placeholder="••••••••"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {/* Input Konfirmasi Password */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Confirm</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all text-sm text-slate-900"
                    placeholder="••••••••"
                    onChange={(e) =>
                      setFormData({ ...formData, password_confirmation: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------------------
             * TOMBOL SUBMIT
             * Dinonaktifkan saat loading.
             * Menampilkan spinner Loader2 saat proses registrasi berjalan.
             * --------------------------------------------------------------- */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white py-4.5 rounded-2xl text-xs font-bold uppercase tracking-[0.25em] transition-all mt-6 flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </button>
          </form>

          {/* ---------------------------------------------------------------
           * LINK KE HALAMAN LOGIN
           * Ditampilkan di bawah form untuk user yang sudah punya akun.
           * --------------------------------------------------------------- */}
          <div className="mt-10 text-center">
            <p className="text-[13px] text-slate-400 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-slate-900 font-bold underline underline-offset-8 hover:text-slate-600 transition-colors">
                Sign In Instead
              </Link>
            </p>
          </div>
        </div>

        {/* Footer kecil di bawah kartu */}
        <p className="text-center mt-8 text-[9px] text-slate-400 font-medium uppercase tracking-[0.3em]">
          Official Evomi Registration Portal
        </p>
      </motion.div>
    </div>
  );
}
