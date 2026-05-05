"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, User, Loader2, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  // Logika state tetap dipertahankan dari source asli[cite: 8]
  const [formData, setFormData] = useState({ login: "", password: "" }); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Menggunakan endpoint dan metode POST sesuai referensi[cite: 8]
      const response = await fetch("https://ramadhan.alwaysdata.net/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Kredensial salah.");

      // Menyimpan token dan data user ke localStorage[cite: 8]
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_data", JSON.stringify(data.user));

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0071bc] px-4 relative">
      {/* NAVIGASI BACK TO HOME: Disesuaikan dengan teks putih untuk kontras di atas bg blue[cite: 8] */}
      <Link
        href="/"
        className="absolute top-8 left-8 z-50 flex items-center space-x-2 text-white/70 hover:text-white transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
          Back to Home
        </span>
      </Link>

      {/* Dekorasi Background: Menggunakan nuansa putih/biru muda transparan[cite: 8] */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-blue-400/20 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white p-10 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-[2.5rem]">
          {/* Header Portal: Menggunakan warna teks #0071bc[cite: 8] */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-[#0071bc] leading-tight">
              Welcome back to <br />
              <span className="italic uppercase tracking-tighter font-black">Evomi</span>
            </h2>
            <div className="h-1 w-8 bg-[#0071bc] mx-auto mt-4 rounded-full" />
          </div>

          {/* Pesan Error[cite: 8] */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl text-center uppercase tracking-wide">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Field Username/Email[cite: 8] */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-[#0071bc] font-bold ml-1 opacity-70">
                Username or Email
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200 group-focus-within:text-[#0071bc] transition-colors" />
                <input
                  type="text"
                  required
                  className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:bg-white focus:border-[#0071bc] focus:ring-4 focus:ring-blue-100 transition-all text-sm text-[#0071bc] placeholder:text-blue-300"
                  placeholder="Enter your details"
                  onChange={(e) =>
                    setFormData({ ...formData, login: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Field Password[cite: 8] */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-[#0071bc] font-bold ml-1 opacity-70">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200 group-focus-within:text-[#0071bc] transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:bg-white focus:border-[#0071bc] focus:ring-4 focus:ring-blue-100 transition-all text-sm text-[#0071bc] placeholder:text-blue-300"
                  placeholder="••••••••"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Tombol Sign In: Menggunakan bg #0071bc[cite: 8] */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0071bc] hover:bg-blue-700 disabled:bg-blue-300 text-white py-4.5 rounded-2xl text-xs font-bold uppercase tracking-[0.25em] transition-all mt-6 flex items-center justify-center gap-2 shadow-xl shadow-blue-100 active:scale-[0.97]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Link ke Register: Menggunakan warna aksen #0071bc[cite: 8] */}
          <div className="mt-12 text-center">
            <p className="text-[13px] text-blue-300 font-medium">
              New to the platform?{" "}
              <Link
                href="/register"
                className="text-[#0071bc] font-bold underline underline-offset-8 hover:text-blue-800 transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}