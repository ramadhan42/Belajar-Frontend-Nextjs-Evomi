"use client";

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - useEffect & useState : manajemen state dan lifecycle komponen
 * - Image                : komponen gambar optimasi dari Next.js
 * - Link                 : navigasi ke halaman checkout dan produk
 * - BASE_URL             : konstanta URL API global
 * ========================================================================= */
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BASE_URL } from "@/src/config/strings";

/* =========================================================================
 * INTERFACE: CartItem
 * Mendefinisikan struktur data satu item di keranjang belanja.
 * Sesuai dengan format JSON yang dikirim oleh API Laravel.
 * - product_id : ID unik produk (digunakan sebagai key dan untuk hapus item)
 * - name       : nama produk
 * - price      : harga satuan produk
 * - quantity   : jumlah item dalam keranjang
 * - image_url  : URL lengkap gambar produk
 * - image      : nama file gambar (field tambahan dari API)
 * ========================================================================= */
interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  image: string;
}

/* =========================================================================
 * KOMPONEN UTAMA: ShoppingBag
 * Menampilkan isi keranjang belanja user yang sedang login.
 * Fitur:
 * - Fetch data keranjang dari API saat komponen dimuat
 * - Hapus item dengan optimistic UI update (tampilan diperbarui sebelum API selesai)
 * - Kalkulasi subtotal otomatis dari semua item
 * - State kosong: tampilkan pesan dan tombol "Mulai Belanja"
 * - Tombol "Proceed to Checkout" mengarah ke halaman /checkout
 * ========================================================================= */
export default function ShoppingBag() {

  /* -----------------------------------------------------------------------
   * STATE
   * - cartItems : array item yang ada di keranjang belanja user
   * - loading   : indikator loading saat fetch data keranjang
   * - error     : pesan error jika fetch gagal atau user belum login
   * ----------------------------------------------------------------------- */
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* -----------------------------------------------------------------------
   * FUNGSI: fetchCart
   * Mengambil data keranjang belanja user dari API.
   * - Menampilkan pesan error jika token tidak ditemukan (belum login)
   * - Menyimpan array cart dari response ke state cartItems
   * - Response API: { status: 'success', cart: [...] }
   * ----------------------------------------------------------------------- */
  const fetchCart = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Silakan login untuk melihat Shopping Bag Anda.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(BASE_URL + `/api/cart`, {
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

  /* -----------------------------------------------------------------------
   * FUNGSI: handleRemove
   * Menghapus satu item dari keranjang berdasarkan product_id.
   * Menggunakan pola Optimistic UI Update:
   * 1. Hapus item dari state terlebih dahulu agar UI terasa responsif
   * 2. Kirim request DELETE ke API di background
   * 3. Jika API gagal, panggil fetchCart() untuk mengembalikan data asli
   * @param productId - ID produk yang akan dihapus dari keranjang
   * ----------------------------------------------------------------------- */
  const handleRemove = async (productId: string) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // Optimistic update: hapus dari tampilan dulu agar terasa cepat
    setCartItems((prev) =>
      prev.filter((item) => item.product_id !== productId),
    );

    try {
      await fetch(BASE_URL + `/api/cart/${productId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Remove Error:", err);
      // Jika gagal, kembalikan data keranjang seperti semula
      fetchCart();
    }
  };

  /* -----------------------------------------------------------------------
   * KALKULASI: subtotal
   * Menghitung total harga semua item di keranjang.
   * Dihitung ulang setiap kali cartItems berubah (derived value).
   * ----------------------------------------------------------------------- */
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  /* -----------------------------------------------------------------------
   * EFFECT: Inisialisasi Data
   * Memanggil fetchCart satu kali saat komponen pertama kali dimuat.
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    fetchCart();
  }, []);

  /* -----------------------------------------------------------------------
   * LOADING STATE
   * Menampilkan teks animasi pulse saat data keranjang belum selesai dimuat.
   * ----------------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="p-8 text-center text-stone-500 animate-pulse">
        Memuat keranjang Anda...
      </div>
    );
  }

  /* -----------------------------------------------------------------------
   * ERROR STATE
   * Menampilkan pesan error jika fetch gagal atau user belum login.
   * ----------------------------------------------------------------------- */
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-100">
      <h2 className="text-2xl text-stone-800 font-serif mb-6 uppercase tracking-widest">
        Shopping Bag
      </h2>

      {/* ===================================================================
       * STATE KOSONG
       * Ditampilkan jika keranjang tidak memiliki item.
       * Tombol "Mulai Belanja" mengarahkan ke section produk di landing page.
       * =================================================================== */}
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-500 mb-4">Shopping bag Anda masih kosong.</p>
          <Link
            href="/#product"
            className="inline-block border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white px-6 py-2 uppercase tracking-widest text-xs transition-colors"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* ===============================================================
           * DAFTAR ITEM KERANJANG
           * Setiap item menampilkan:
           * - Thumbnail gambar produk
           * - Nama, harga satuan, jumlah (qty), dan tombol Remove
           * - Total harga per item (hanya tampil di desktop)
           * =============================================================== */}
          <div className="divide-y divide-stone-100">
            {cartItems.map((item) => (
              <div
                key={item.product_id}
                className="py-6 flex gap-4 md:gap-6 items-center"
              >
                {/* Thumbnail gambar produk */}
                <div className="relative w-20 h-24 md:w-24 md:h-32 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={`${item.image_url}`}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Detail produk: nama, harga, qty, tombol hapus */}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-stone-800">
                    {item.name}
                  </h3>
                  <p className="text-stone-500 text-sm mt-1">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>

                  <div className="flex items-center gap-4 mt-4">
                    {/* Badge jumlah item */}
                    <span className="text-xs text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                      Qty: {item.quantity}
                    </span>
                    {/* Tombol hapus item — memanggil handleRemove dengan optimistic update */}
                    <button
                      onClick={() => handleRemove(item.product_id)}
                      className="text-xs text-red-400 hover:text-red-600 underline underline-offset-2 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Total harga per item — hanya tampil di layar desktop */}
                <div className="text-right hidden md:block">
                  <p className="font-medium text-stone-800">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ===============================================================
           * RINGKASAN PEMBAYARAN & TOMBOL CHECKOUT
           * Menampilkan subtotal total semua item dan tombol
           * "Proceed to Checkout" yang mengarah ke halaman /checkout.
           * Ikon panah bergerak ke kanan saat tombol di-hover.
           * =============================================================== */}
          <div className="mt-8 pt-8 border-t border-stone-200">
            {/* Baris subtotal */}
            <div className="flex justify-between items-end mb-6">
              <span className="text-stone-500 uppercase tracking-widest text-sm">
                Subtotal
              </span>
              <span className="text-2xl font-serif text-stone-900">
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Tombol checkout — ikon panah bergerak ke kanan saat hover */}
            <Link href="/checkout">
              <button className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-md flex justify-center items-center gap-2 group">
                Proceed to Checkout
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
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
