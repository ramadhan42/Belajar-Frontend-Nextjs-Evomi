"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, User, Mail, AtSign, Loader2, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  // State untuk form sesuai kebutuhan API Laravel
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://ramadhan.alwaysdata.net/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registrasi gagal.");
      }

      // Simpan Token dan Data User sesuai referensi
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_data", JSON.stringify(data.user));

      router.push("/");
      
      // Refresh untuk memperbarui state auth di komponen lain
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
    <div className="min-h-screen flex items-center justify-center bg-[#0071bc] px-4 py-12">
      {/* Dekorasi Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-blue-300/20 rounded-full blur-[100px]" />
      </div>

      {/* Back to Home Link */}
      <Link
        href="/"
        className="absolute top-8 left-8 z-50 flex items-center space-x-2 text-white/70 hover:text-white transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
          Back to Home
        </span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg z-10"
      >
        <div className="bg-white border border-slate-200 p-10 shadow-[0_8px_40px_rgba(0,0,0,0.1)] rounded-[2.5rem]">
          {/* Header Konten */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-[#0071bc] leading-tight">
              Join the community <br />
              <span className="italic uppercase tracking-tighter font-black text-[#0071bc]">Evomi</span>
            </h2>
            <div className="h-1 w-8 bg-[#0071bc] mx-auto mt-4 rounded-full" />
          </div>

          {/* Pesan Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl text-center uppercase tracking-wide">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#0071bc] transition-colors" />
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:border-[#0071bc] focus:ring-4 focus:ring-[#0071bc]/10 transition-all text-sm text-[#0071bc]"
                    placeholder="Full Name"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">
                  Username
                </label>
                <div className="relative group">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#0071bc] transition-colors" />
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:border-[#0071bc] focus:ring-4 focus:ring-[#0071bc]/10 transition-all text-sm text-[#0071bc]"
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

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#0071bc] transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:border-[#0071bc] focus:ring-4 focus:ring-[#0071bc]/10 transition-all text-sm text-[#0071bc]"
                  placeholder="email@customer.com"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#0071bc] transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:border-[#0071bc] focus:ring-4 focus:ring-[#0071bc]/10 transition-all text-sm text-[#0071bc]"
                    placeholder="••••••••"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">
                  Confirm
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#0071bc] transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:border-[#0071bc] focus:ring-4 focus:ring-[#0071bc]/10 transition-all text-sm text-[#0071bc]"
                    placeholder="••••••••"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password_confirmation: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0071bc] hover:bg-[#005a96] disabled:bg-slate-400 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-[0.25em] transition-all mt-6 flex items-center justify-center gap-2 shadow-xl shadow-[#0071bc]/30"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[13px] text-slate-400 font-medium">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#0071bc] font-bold underline underline-offset-8 hover:text-[#005a96] transition-colors"
              >
                Sign In Instead
              </Link>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[9px] text-white/70 font-medium uppercase tracking-[0.3em]">
          Official Evomi Registration Portal
        </p>
      </motion.div>
    </div>
  );
}