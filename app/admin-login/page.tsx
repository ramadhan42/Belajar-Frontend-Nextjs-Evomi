"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";

// String global url
import { BASE_URL } from "@/src/config/strings";

export default function AdminLogin() {
    // State manajemen menggunakan logika dari source asli
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    // Handler untuk login, menggunakan endpoint API dan metode POST sesuai referensi
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Menggunakan endpoint API dan metode POST sesuai referensi
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
                // Menyimpan token dan mengalihkan halaman
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
            {/* Latar belakang dengan aksen cahaya lembut */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute -top-[10%] -right-[5%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px]" />
                <div className="absolute -bottom-[10%] -left-[5%] w-[30%] h-[30%] bg-slate-100 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md z-10 px-6"
            >
                <div className="bg-white border border-slate-200 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
                    {/* Header: Menghilangkan tulisan Romano dan menggantinya dengan ikon keamanan */}
                    <div className="text-center mb-10">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-200">
                            <ShieldCheck className="text-white w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">Admin Portal</h2>
                        <p className="text-xs text-slate-500 mt-2 font-medium uppercase tracking-[0.15em]">
                            Secure Management Access
                        </p>
                    </div>

                    {/* Alert Error */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email Input */}
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

                        {/* Password Input */}
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

                        {/* Submit Button */}
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

                    {/* Footer */}
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