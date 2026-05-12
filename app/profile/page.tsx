"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import ShoppingBag from "@/components/ShoppingBag";

// String global url
import { BASE_URL } from "@/src/config/strings";

import WavyNavbarGradient from "@/components/WavyNavbarGradient";

// --- Animasi Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
  }
};

// TODO: Add discount logic here
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    }
  }
};

// --- Font Configuration ---
const fontJudul = localFont({
  src: "../fonts/8 Heavy.ttf",
  variable: "--font-brand",
  display: "swap",
});

// TODO: Add discount logic here
const fontCaption = localFont({
  src: "../fonts/Nohemi-Regular.otf",
  variable: "--font-body",
  display: "swap",
});

// TODO: Add discount logic here
export default function LuxuryProfilePage() {
  const [formData, setFormData] = useState({
    id: '', // id user
    name: '', // name user
    username: '', // username user
    email: '', // email user
    current_password: '', // current password user
    new_password: '', // new password user
    new_password_confirmation: '', // new password confirmation user
    image: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);  // TODO: Add discount logic here
  const [isModalOpen, setIsModalOpen] = useState(false);  // TODO: Add discount logic here
  const [loading, setLoading] = useState(false);  // TODO: Add discount logic here
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null, text: string }>({ type: null, text: "" });  // TODO: Add discount logic here
  const [user, setUser] = useState<{ id: string; name: string; username: string; email: string; image?: string; } | null>(null);  // TODO: Add discount logic here
  const [activeTab, setActiveTab] = useState("cart");  // TODO: Add discount logic here
  const [mounted, setMounted] = useState(false);  // TODO: Add discount logic here
  const router = useRouter();  // TODO: Add discount logic here

  // 2. TAMBAHKAN: Logika Status Online / Offline
  useEffect(() => {
    if (!user) return;

    // Fungsi Set ONLINE
    const setOnlineStatus = async () => {
      try {
        const token = localStorage.getItem("access_token");
        await fetch(`${BASE_URL}/api/user/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ is_online: 1 })
        });
      } catch (err) {
        console.error("Gagal update status online:", err);
      }
    };

    setOnlineStatus();

    // Fungsi Beacon untuk Set OFFLINE
    const handleOfflineBeacon = () => {
      const url = `${BASE_URL}/api/user/status-beacon`;
      const data = JSON.stringify({
        user_id: user.id,
        is_online: 0
      });
      const blob = new Blob([data], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    };

    window.addEventListener('beforeunload', handleOfflineBeacon);

    return () => {
      // Set offline saat pindah halaman
      handleOfflineBeacon();
      window.removeEventListener('beforeunload', handleOfflineBeacon);
    };
  }, [user]);

  useEffect(() => { // TODO: Add discount logic here
    setMounted(true);

    // TODO: Add discount logic here
    const fetchUserData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // TODO: Add discount logic here
        const response = await fetch(BASE_URL + "/api/user", {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
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
        const savedUser = localStorage.getItem("user_data");
        if (savedUser) setUser(JSON.parse(savedUser));
      }
    };
    fetchUserData();
  }, [router]);

  const handleLogout = () => { // TODO: Add discount logic here
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    router.push("/");
    router.refresh();
  };

  // TODO: Add discount logic here
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const closeModal = () => { // TODO: Add discount logic here
    setIsModalOpen(false);
    setFormData(prev => ({ ...prev, current_password: '', new_password: '', new_password_confirmation: '', image: null }));
    setImagePreview(null);
    setStatusMessage({ type: null, text: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => { // TODO: Add discount logic here
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
        setTimeout(closeModal, 2000);
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

      {/* NAVBAR */}
      <nav className="fixed w-full z-[100] bg-[#0071bc] backdrop-blur-xl border-b border-white/5 shadow-sm px-8 h-20 flex items-center justify-between">

        {/* BARU: Memanggil Komponen Wavy Curve */}
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

      {/* AMBIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 2 }}
          className="absolute top-20 left-10 w-[30rem] h-[30rem] bg-stone-200/40 rounded-full blur-[100px]"
        ></motion.div>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 2, delay: 0.5 }}
          className="absolute bottom-20 right-10 w-[30rem] h-[30rem] bg-amber-100/30 rounded-full blur-[100px]"
        ></motion.div>
      </div>

      <main className="relative pt-36 pb-20 px-6 md:px-12 max-w-7xl mx-auto grid md:grid-cols-12 gap-12 lg:gap-20">

        {/* LEFT: IDENTITY SIDEBAR */}
        <div className="md:col-span-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-10 sticky top-36"
          >
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

            <motion.div variants={fadeInUp} className="space-y-2">
              <h2 className={`${fontJudul.className} text-3xl uppercase tracking-tighter text-stone-900`}>{user.name}</h2>
              <p className="text-stone-400 text-xs tracking-widest uppercase font-medium">@{user.username}</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="h-[1px] bg-stone-200 w-12"></motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col space-y-5">
              {[
                { id: "cart", label: "Shopping Bag" },
                { id: "identity", label: "Account Details" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`text-left text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-500 ${activeTab === item.id ? "text-stone-900 translate-x-2" : "text-stone-300 hover:text-stone-500"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT: CONTENT PANEL */}
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
                <div className="space-y-8">
                  <h3 className={`${fontJudul.className} text-xl uppercase tracking-widest text-stone-800 border-b border-stone-50 pb-6`}>Current Bag</h3>
                  <ShoppingBag />
                </div>
              ) : (
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

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-10 md:p-14 shadow-2xl overflow-hidden border border-stone-100"
            >
              <div className="space-y-8">
                <div>
                  <h3 className={`${fontJudul.className} text-2xl uppercase tracking-tighter mb-1`}>Refine Identity</h3>
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest">Digital Presence Maintenance</p>
                </div>

                {statusMessage.text && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={`p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
                  >
                    {statusMessage.text}
                  </motion.div>
                )}

                <form className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar" onSubmit={handleSubmit}>
                  <div className="flex flex-col items-center space-y-4 pb-4">
                    <div className="relative group w-24 h-24">
                      <div className="w-full h-full bg-stone-50 rounded-[1.5rem] overflow-hidden border-2 border-dashed border-stone-200 flex items-center justify-center transition-all group-hover:border-stone-400">
                        {(imagePreview || (user.image && user.image !== 'default-avatar.png')) ? (
                          <img src={imagePreview || `https://ramadhan.alwaysdata.net/storage/profiles/${user.image}`} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <span className="text-[8px] text-stone-300 font-bold uppercase tracking-widest">No Portrait</span>
                        )}
                      </div>
                      <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-stone-900/40 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-all">
                        <span className="text-[8px] text-white font-black uppercase tracking-widest">Change</span>
                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Full Name" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} />
                    <InputGroup label="Username" value={formData.username} onChange={(v: string) => setFormData({ ...formData, username: v })} />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-stone-100">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Security Update</p>
                    <InputGroup label="Current Password" type="password" value={formData.current_password} onChange={(v: string) => setFormData({ ...formData, current_password: v })} placeholder="••••••••" />
                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup label="New Password" type="password" value={formData.new_password} onChange={(v: string) => setFormData({ ...formData, new_password: v })} placeholder="Secret" />
                      <InputGroup label="Confirm New" type="password" value={formData.new_password_confirmation} onChange={(v: string) => setFormData({ ...formData, new_password_confirmation: v })} placeholder="Repeat" />
                    </div>
                  </div>

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

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-stone-300">{label}</label>
      <p className="text-base font-light text-stone-800 border-b border-stone-50 pb-2">{value}</p>
    </div>
  );
}

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