"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id?: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at?: string;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ADMIN_ID = 1;
  const API_BASE_URL = "https://ramadhan.alwaysdata.net/api";

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

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chats]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
          className="fixed bottom-24 right-6 md:right-8 w-[90vw] md:w-96 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,113,188,0.15)] z-[100] overflow-hidden border border-blue-100 flex flex-col font-sans"
        >
          {/* Header - Berwarna BG #0071bc[cite: 10] */}
          <div className="bg-[#0071bc] p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">
                EV
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">Evomi Support</h3>
                <p className="text-[10px] text-blue-200">Online</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Body - Berwarna BG Terang agar teks terlihat[cite: 10] */}
          <div
            ref={scrollRef}
            className="h-80 p-4 overflow-y-auto bg-blue-50/30 flex flex-col gap-6 scroll-smooth"
          >
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 opacity-30">
                <div className="w-10 h-10 rounded-full border border-[#0071bc] flex items-center justify-center text-[10px] text-[#0071bc]">EV</div>
                <p className="text-center text-[#0071bc] text-[10px] uppercase tracking-widest">Belum ada pesan</p>
              </div>
            ) : (
              chats.map((chat, index) => {
                const isMe = chat.sender_id === currentUserId;

                return (
                  <div
                    key={chat.id || index}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-1`}
                  >
                    {/* Label Pengirim - Berwarna Teks #0071bc[cite: 10] */}
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#0071bc] mb-1.5 px-1 opacity-70">
                      {isMe ? "You" : "Evomi Support"}
                    </span>

                    {/* Bubble Chat - User menggunakan BG #0071bc[cite: 10] */}
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${isMe
                          ? "bg-[#0071bc] text-white rounded-tr-none"
                          : "bg-white text-slate-800 rounded-tl-none border border-blue-100"
                        }`}
                    >
                      {chat.message}

                      {/* Waktu Pesan */}
                      {chat.created_at && (
                        <span className={`block text-[8px] mt-2 opacity-60 tracking-tighter ${isMe ? 'text-right' : 'text-left'}`}>
                          {new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input - Tombol Kirim menggunakan BG #0071bc[cite: 10] */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-blue-50 flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={currentUserId ? "Ketik pesan..." : "Silakan login untuk chat"}
              disabled={!currentUserId || loading}
              className="flex-1 bg-blue-50/50 text-sm px-4 py-2.5 rounded-full outline-none text-[#0071bc] placeholder-blue-300 focus:ring-1 focus:ring-[#0071bc] transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!message.trim() || loading || !currentUserId}
              className="w-10 h-10 bg-[#0071bc] text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
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