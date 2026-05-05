"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, User, Loader2, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  // Menggunakan state dan logika dari source asli
  const [formData, setFormData] = useState({ login: "", password: "" }); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Menggunakan endpoint dan metode POST sesuai referensi
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

      // Menyimpan token dan data user ke localStorage
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 relative">
      {/* NAVIGASI BACK TO HOME: Meniru pola navigasi pada halaman Register */}
      <Link
        href="/"
        className="absolute top-8 left-8 z-50 flex items-center space-x-2 text-slate-400 hover:text-slate-900 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
          Back to Home
        </span>
      </Link>

      {/* Dekorasi Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-slate-100 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-blue-50/50 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white border border-slate-200 p-10 shadow-[0_8px_40px_rgba(0,0,0,0.03)] rounded-[2.5rem]">
          {/* Header Portal */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
              Welcome back to <br />
              <span className="italic uppercase tracking-tighter font-black text-slate-800">Evomi</span>
            </h2>
            <div className="h-1 w-8 bg-slate-900 mx-auto mt-4 rounded-full" />
          </div>

          {/* Pesan Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl text-center uppercase tracking-wide">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Field Username/Email */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-slate-400 font-bold ml-1">
                Username or Email
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all text-sm text-slate-900 placeholder:text-slate-400"
                  placeholder="Enter your details"
                  onChange={(e) =>
                    setFormData({ ...formData, login: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Field Password */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-slate-400 font-bold ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all text-sm text-slate-900 placeholder:text-slate-400"
                  placeholder="••••••••"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Tombol Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white py-4.5 rounded-2xl text-xs font-bold uppercase tracking-[0.25em] transition-all mt-6 flex items-center justify-center gap-2 shadow-xl shadow-slate-200 active:scale-[0.97]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Link ke Register */}
          <div className="mt-12 text-center">
            <p className="text-[13px] text-slate-400 font-medium">
              New to the platform?{" "}
              <Link
                href="/register"
                className="text-slate-900 font-bold underline underline-offset-8 hover:text-slate-600 transition-colors"
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