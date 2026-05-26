"use client";

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - useState       : manajemen state form dan loading
 * - useRouter      : navigasi programatik ke dashboard setelah login berhasil
 * - motion         : animasi masuk halaman menggunakan Framer Motion
 * - Lucide Icons   : ikon untuk field input, loading, dan header kartu
 * - BASE_URL       : konstanta URL API global
 * ========================================================================= */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { BASE_URL } from "@/src/config/strings";

/* =========================================================================
 * KOMPONEN UTAMA: AdminLogin
 * Halaman login khusus untuk akses panel admin.
 * - Mengirim kredensial ke API /admin/login via POST
 * - Menyimpan token ke localStorage jika login berhasil
 * - Redirect ke /admin/dashboard setelah autentikasi sukses
 * - Menampilkan pesan error inline jika kredensial salah atau koneksi gagal
 * ========================================================================= */
export default function AdminLogin() {

    /* -----------------------------------------------------------------------
     * STATE
     * - email     : nilai input email yang diketik admin
     * - password  : nilai input password yang diketik admin
     * - isLoading : indikator loading saat request login sedang berjalan
     * - error     : pesan error yang ditampilkan jika login gagal
     * ----------------------------------------------------------------------- */
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    /* -----------------------------------------------------------------------
     * FUNGSI: handleLogin
     * Menangani submit form login admin.
     * - Mengirim email dan password ke endpoint API /admin/login via POST
     * - Menyimpan token ke localStorage jika response sukses (res.ok)
     * - Redirect ke /admin/dashboard setelah token tersimpan
     * - Menampilkan pesan error dari API atau pesan koneksi gagal jika error
     * ----------------------------------------------------------------------- */
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(BASE_URL + "/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Simpan token dan redirect ke dashboard
                localStorage.setItem("admin_access_token", data.token);
                router.push("/admin/dashboard");
            } else {
                setError(data.message || "Invalid credentials. Please try again.");
            }
        } catch (err) {
            setError("Connection failed. Please check your server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">

            {/* ===================================================================
             * SEKSI 1: LATAR BELAKANG DEKORATIF
             * Dua lingkaran blur sebagai aksen cahaya lembut di sudut layar.
             * =================================================================== */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute -top-[10%] -right-[5%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px]" />
                <div className="absolute -bottom-[10%] -left-[5%] w-[30%] h-[30%] bg-slate-100 rounded-full blur-[100px]" />
            </div>

            {/* ===================================================================
             * SEKSI 2: KARTU LOGIN
             * Animasi fade-in + scale menggunakan Framer Motion saat halaman dimuat.
             * Berisi header, alert error, form input, dan footer versi sistem.
             * =================================================================== */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md z-10 px-6"
            >
                <div className="bg-white border border-slate-200 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">

                    {/* ---------------------------------------------------------------
                     * HEADER KARTU
                     * Ikon ShieldCheck, judul "Admin Portal", dan subtitle akses aman.
                     * --------------------------------------------------------------- */}
                    <div className="text-center mb-10">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-200">
                            <ShieldCheck className="text-white w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">Admin Portal</h2>
                        <p className="text-xs text-slate-500 mt-2 font-medium uppercase tracking-[0.15em]">
                            Secure Management Access
                        </p>
                    </div>

                    {/* ---------------------------------------------------------------
                     * ALERT ERROR
                     * Hanya tampil jika state error tidak kosong.
                     * Menampilkan pesan dari API atau pesan koneksi gagal.
                     * --------------------------------------------------------------- */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {/* ---------------------------------------------------------------
                     * FORM LOGIN
                     * Dua field input: email dan password.
                     * Tombol submit dinonaktifkan saat isLoading = true,
                     * menampilkan spinner Loader2 sebagai indikator proses.
                     * --------------------------------------------------------------- */}
                    <form onSubmit={handleLogin} className="space-y-5">

                        {/* Input Email */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold ml-1">
                                Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all text-sm text-slate-900"
                                    placeholder="name@company.com"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Input Password */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all text-sm text-slate-900"
                                    placeholder="••••••••"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Tombol Submit — spinner saat loading, teks normal saat idle */}
                        <button
                            disabled={isLoading}
                            className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white py-3.5 rounded-xl text-sm font-bold transition-all mt-8 flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Sign In to Dashboard"
                            )}
                        </button>
                    </form>

                    {/* ---------------------------------------------------------------
                     * FOOTER KARTU
                     * Menampilkan versi sistem dan label sesi terverifikasi.
                     * --------------------------------------------------------------- */}
                    <div className="mt-10 text-center">
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">
                            System v4.0.2 • Verified Session
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
