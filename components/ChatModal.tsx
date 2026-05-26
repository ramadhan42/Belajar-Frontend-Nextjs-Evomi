"use client";

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - useState, useEffect, useRef : manajemen state, lifecycle, dan ref scroll
 * - motion & AnimatePresence    : animasi buka/tutup modal (Framer Motion)
 * - BASE_URL                    : konstanta URL API global
 * ========================================================================= */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BASE_URL } from "@/src/config/strings";

/* =========================================================================
 * INTERFACE: ChatModalProps
 * Props yang diterima komponen ChatModal dari parent.
 * - isOpen  : kontrol visibilitas modal chat
 * - onClose : callback untuk menutup modal dari parent
 * ========================================================================= */
interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* =========================================================================
 * INTERFACE: Message
 * Mendefinisikan struktur data satu pesan chat dari API.
 * - id          : ID unik pesan (opsional, digunakan sebagai key)
 * - sender_id   : ID pengirim pesan
 * - receiver_id : ID penerima pesan
 * - message     : isi teks pesan
 * - created_at  : waktu pengiriman dalam format ISO string (opsional)
 * ========================================================================= */
interface Message {
  id?: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at?: string;
}

/* =========================================================================
 * KOMPONEN UTAMA: ChatModal
 * Modal chat floating untuk komunikasi user dengan admin Evomi.
 * Fitur:
 * - Muncul di pojok kanan bawah layar dengan animasi spring
 * - Polling otomatis setiap 5 detik saat modal terbuka
 * - Auto-scroll ke pesan terbaru setiap kali ada pesan baru
 * - Bubble chat berbeda untuk pesan user (kanan) dan admin (kiri)
 * - Input dinonaktifkan jika user belum login
 * - Indikator loading spinner saat pesan sedang dikirim
 * ========================================================================= */
export default function ChatModal({ isOpen, onClose }: ChatModalProps) {

  /* -----------------------------------------------------------------------
   * STATE
   * - message       : nilai teks input pesan yang sedang diketik
   * - chats         : array riwayat pesan dari API
   * - loading       : indikator loading saat pesan sedang dikirim
   * - currentUserId : ID user yang sedang login (diambil dari localStorage)
   * ----------------------------------------------------------------------- */
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  /* -----------------------------------------------------------------------
   * REF: scrollRef
   * Referensi ke container chat body untuk auto-scroll ke pesan terbaru.
   * ----------------------------------------------------------------------- */
  const scrollRef = useRef<HTMLDivElement>(null);

  /* -----------------------------------------------------------------------
   * KONSTANTA
   * - ADMIN_ID    : ID admin yang menjadi tujuan pengiriman pesan
   * - API_BASE_URL: base URL endpoint API chat
   * ----------------------------------------------------------------------- */
  const ADMIN_ID = 1;
  const API_BASE_URL = BASE_URL + "/api";

  /* -----------------------------------------------------------------------
   * EFFECT: Inisialisasi User ID (Hydration Safe)
   * Mengambil ID user dari localStorage hanya di sisi client.
   * Pengecekan typeof window memastikan tidak dijalankan saat SSR.
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user_data");
      if (savedUser) {
        try {
          setCurrentUserId(JSON.parse(savedUser).id);
        } catch (error) {
          console.error("Error parsing user data", error);
        }
      }
    }
  }, []);

  /* -----------------------------------------------------------------------
   * FUNGSI: fetchMessages
   * Mengambil riwayat pesan antara user dan admin dari API.
   * - Hanya berjalan di sisi client (pengecekan typeof window)
   * - Membutuhkan token autentikasi di localStorage
   * ----------------------------------------------------------------------- */
  const fetchMessages = async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/chats/${ADMIN_ID}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });
      const result = await response.json();
      if (result.success) {
        setChats(result.data);
      }
    } catch (error) {
      console.error("Gagal mengambil pesan:", error);
    }
  };

  /* -----------------------------------------------------------------------
   * EFFECT: Polling Pesan Otomatis
   * Memanggil fetchMessages saat modal pertama kali dibuka,
   * kemudian melakukan polling setiap 5 detik selama modal terbuka.
   * Interval dibersihkan saat modal ditutup atau komponen di-unmount.
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  /* -----------------------------------------------------------------------
   * EFFECT: Auto-Scroll ke Pesan Terbaru
   * Setiap kali array chats berubah (pesan baru masuk atau terkirim),
   * container chat di-scroll otomatis ke bagian paling bawah.
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chats]);

  /* -----------------------------------------------------------------------
   * FUNGSI: handleSend
   * Mengirim pesan baru ke admin melalui API.
   * - Validasi: pesan tidak boleh kosong, token dan currentUserId harus ada
   * - Menambahkan pesan baru ke state chats setelah berhasil terkirim
   * - Mengosongkan input setelah pesan berhasil dikirim
   * ----------------------------------------------------------------------- */
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");

    if (!message.trim() || !token || !currentUserId) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({
          receiver_id: ADMIN_ID,
          message: message,
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Tambahkan pesan baru ke state dan kosongkan input
        setChats((prev) => [...prev, result.data]);
        setMessage("");
      }
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    /* =========================================================================
     * ANIMASI BUKA/TUTUP MODAL
     * AnimatePresence memungkinkan animasi exit saat isOpen berubah ke false.
     * Animasi: spring bounce dari bawah + scale saat masuk, fade + scale saat keluar.
     * ========================================================================= */
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
          className="fixed bottom-24 right-6 md:right-8 w-[90vw] md:w-96 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-[100] overflow-hidden border border-stone-200 flex flex-col font-sans"
        >

          {/* ===================================================================
           * SEKSI 1: HEADER MODAL
           * Menampilkan avatar "EV", nama "Evomi Support", status online,
           * dan tombol X untuk menutup modal.
           * =================================================================== */}
          <div className="bg-stone-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              {/* Avatar inisial admin */}
              <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center font-bold text-[10px]">
                EV
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-100">Evomi Support</h3>
                <p className="text-[10px] text-green-400">Online</p>
              </div>
            </div>
            {/* Tombol tutup modal */}
            <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ===================================================================
           * SEKSI 2: BODY CHAT (RIWAYAT PESAN)
           * Container scrollable dengan ref untuk auto-scroll ke bawah.
           * - State kosong: tampilkan placeholder "Belum ada pesan"
           * - Ada pesan: render bubble chat untuk setiap pesan
           *   - isMe = true  → bubble kanan (bg-stone-900, teks putih)
           *   - isMe = false → bubble kiri (bg-white, border)
           * =================================================================== */}
          <div
            ref={scrollRef}
            className="h-80 p-4 overflow-y-auto bg-[#FBFBF9] flex flex-col gap-6 scroll-smooth"
          >
            {chats.length === 0 ? (
              /* Placeholder saat belum ada pesan */
              <div className="flex flex-col items-center justify-center h-full gap-2 opacity-30">
                <div className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-[10px]">EV</div>
                <p className="text-center text-stone-400 text-[10px] uppercase tracking-widest">Belum ada pesan</p>
              </div>
            ) : (
              chats.map((chat, index) => {
                /* Tentukan arah bubble: kanan jika dikirim user, kiri jika dari admin */
                const isMe = chat.sender_id === currentUserId;

                return (
                  <div
                    key={chat.id || index}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-1`}
                  >
                    {/* Label pengirim: "You" atau "Evomi Support" */}
                    <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1.5 px-1">
                      {isMe ? "You" : "Evomi Support"}
                    </span>

                    {/* Bubble chat — style berbeda untuk user dan admin */}
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                        isMe
                          ? "bg-stone-900 text-white rounded-tr-none"
                          : "bg-white text-stone-800 rounded-tl-none border border-stone-200"
                      }`}
                    >
                      {chat.message}

                      {/* Timestamp pesan — hanya tampil jika created_at tersedia */}
                      {chat.created_at && (
                        <span className={`block text-[8px] mt-2 opacity-40 tracking-tighter ${isMe ? 'text-right' : 'text-left'}`}>
                          {new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ===================================================================
           * SEKSI 3: INPUT PESAN
           * Form pengiriman pesan dengan input teks dan tombol kirim.
           * - Input disabled jika user belum login atau sedang loading
           * - Placeholder berubah sesuai status login user
           * - Tombol kirim menampilkan spinner saat loading, ikon send saat idle
           * - Tombol disabled jika pesan kosong, loading, atau belum login
           * =================================================================== */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-100 flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={currentUserId ? "Ketik pesan..." : "Silakan login untuk chat"}
              disabled={!currentUserId || loading}
              className="flex-1 bg-stone-100 text-sm px-4 py-2.5 rounded-full outline-none text-stone-800 placeholder-stone-400 focus:ring-1 focus:ring-stone-300 transition-all disabled:opacity-50"
            />
            {/* Tombol kirim — spinner saat loading, ikon send saat idle */}
            <button
              type="submit"
              disabled={!message.trim() || loading || !currentUserId}
              className="w-10 h-10 bg-stone-900 text-white rounded-full flex items-center justify-center hover:bg-stone-800 transition-colors disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
