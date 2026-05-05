"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Interface untuk message
interface Message {
  id?: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at?: string;
}

// Component ChatModal
export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  // 1. Tetapkan currentUserId sebagai State
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ADMIN_ID = 1;
  const API_BASE_URL = "https://ramadhan.alwaysdata.net/api";

  // 2. Ambil ID User hanya di sisi Client (Hydration Safe)
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

  const fetchMessages = async () => {
    // Gunakan pengecekan window untuk localStorage di dalam fungsi async
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

  // Fungsi untuk fetch messages
  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Fungsi untuk scroll ke bawah
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chats]);

  // Fungsi untuk send message
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
        setChats((prev) => [...prev, result.data]);
        setMessage("");
      }
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
    } finally {
      setLoading(false);
    }
  };

  // BARIS 130 YANG ERROR SUDAH DIHAPUS DI SINI

  return (
    <AnimatePresence> {/* TODO: Add animation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
          className="fixed bottom-24 right-6 md:right-8 w-[90vw] md:w-96 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-[100] overflow-hidden border border-stone-200 flex flex-col font-sans"
        >
          {/* Header */}
          <div className="bg-stone-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center font-bold text-[10px]">
                EV
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-100">Evomi Support</h3>
                <p className="text-[10px] text-green-400">Online</p>
              </div>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Body */}
          <div
            ref={scrollRef}
            className="h-80 p-4 overflow-y-auto bg-[#FBFBF9] flex flex-col gap-6 scroll-smooth"
          >
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 opacity-30">
                <div className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-[10px]">EV</div>
                <p className="text-center text-stone-400 text-[10px] uppercase tracking-widest">Belum ada pesan</p>
              </div>
            ) : (
              chats.map((chat, index) => {
                // Tentukan apakah pesan dikirim oleh user yang sedang login (Kanan)
                const isMe = chat.sender_id === currentUserId;

                return (
                  <div
                    key={chat.id || index}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-1`}
                  >
                    {/* Nama Pengirim: Tampilkan "Evomi Support" jika bukan dari user */}
                    <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1.5 px-1">
                      {isMe ? "You" : "Evomi Support"}
                    </span>

                    {/* Bubble Chat */}
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${isMe
                          ? "bg-stone-900 text-white rounded-tr-none"
                          : "bg-white text-stone-800 rounded-tl-none border border-stone-200"
                        }`}
                    >
                      {chat.message}

                      {/* Waktu Pesan */}
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

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-100 flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={currentUserId ? "Ketik pesan..." : "Silakan login untuk chat"}
              disabled={!currentUserId || loading}
              className="flex-1 bg-stone-100 text-sm px-4 py-2.5 rounded-full outline-none text-stone-800 placeholder-stone-400 focus:ring-1 focus:ring-stone-300 transition-all disabled:opacity-50"
            />
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