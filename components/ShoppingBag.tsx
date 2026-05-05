"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Definisikan tipe data sesuai dengan yang kita simpan di JSON Laravel[cite: 12]
interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  image: string;
}

export default function ShoppingBag() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fungsi untuk mengambil data keranjang dari Laravel[cite: 12]
  const fetchCart = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Silakan login untuk melihat Shopping Bag Anda.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://ramadhan.alwaysdata.net/api/cart`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart || []);
      } else {
        setError("Gagal memuat data keranjang.");
      }
    } catch (err) {
      console.error("Fetch Cart Error:", err);
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menghapus item[cite: 12]
  const handleRemove = async (productId: string) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setCartItems((prev) =>
      prev.filter((item) => item.product_id !== productId),
    );

    try {
      await fetch(`https://ramadhan.alwaysdata.net/api/cart/${productId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
      });
    } catch (err) {
      console.error("Remove Error:", err);
      fetchCart();
    }
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-[#0071bc] animate-pulse font-medium">
        Memuat keranjang Anda...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-blue-50">
      {/* Teks Judul menggunakan warna #0071bc[cite: 12] */}
      <h2 className="text-2xl text-[#0071bc] font-bold mb-6 uppercase tracking-widest">
        Shopping Bag
      </h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Shopping bag Anda masih kosong.</p>
          <Link
            href="/#product"
            className="inline-block border border-[#0071bc] text-[#0071bc] hover:bg-[#0071bc] hover:text-white px-6 py-2 uppercase tracking-widest text-xs font-bold transition-all rounded-lg"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* List Produk[cite: 12] */}
          <div className="divide-y divide-blue-50">
            {cartItems.map((item) => (
              <div
                key={item.product_id}
                className="py-6 flex gap-4 md:gap-6 items-center"
              >
                {/* Gambar Produk */}
                <div className="relative w-20 h-24 md:w-24 md:h-32 bg-blue-50 rounded-xl overflow-hidden shrink-0 border border-blue-50">
                  <Image
                    src={`${item.image_url}`}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Detail Produk[cite: 12] */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#0071bc]">
                    {item.name}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>

                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-xs text-[#0071bc] font-bold bg-blue-50 px-3 py-1 rounded-full">
                      Qty: {item.quantity}
                    </span>
                    <button
                      onClick={() => handleRemove(item.product_id)}
                      className="text-xs text-red-400 hover:text-red-600 underline underline-offset-4 transition-colors font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Total Harga per Item - Warna teks #0071bc[cite: 12] */}
                <div className="text-right hidden md:block">
                  <p className="font-bold text-[#0071bc]">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Ringkasan Pembayaran - Warna teks #0071bc[cite: 12] */}
          <div className="mt-8 pt-8 border-t border-blue-100">
            <div className="flex justify-between items-end mb-6">
              <span className="text-[#0071bc] uppercase tracking-widest text-xs font-bold opacity-70">
                Subtotal
              </span>
              <span className="text-2xl font-bold text-[#0071bc]">
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Tombol Checkout menggunakan warna #0071bc[cite: 12] */}
            <Link href="/checkout">
              <button className="w-full bg-[#0071bc] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 flex justify-center items-center gap-2 group">
                Proceed to Checkout
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}