"use client";

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - useState   : manajemen state loading dan modal notifikasi
 * - useRouter  : navigasi ke halaman login jika user belum terautentikasi
 * - BASE_URL   : konstanta URL API global
 * ========================================================================= */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/src/config/strings";

/* =========================================================================
 * INTERFACE: CartProps
 * Mendefinisikan props yang diterima komponen AddToCartButton.
 * - productId   : ID produk yang akan ditambahkan ke keranjang
 * - productName : nama produk (diteruskan dari parent, reserved untuk kebutuhan masa depan)
 * - price       : harga produk (diteruskan dari parent, reserved untuk kebutuhan masa depan)
 * - image       : URL gambar produk (diteruskan dari parent, reserved untuk kebutuhan masa depan)
 * - stock       : jumlah stok tersedia — tombol disabled jika stock = 0
 * - onSuccess   : callback opsional yang dipanggil setelah berhasil menambah ke keranjang
 * ========================================================================= */
interface CartProps {
  productId: string;
  productName: string;
  price: number;
  image: string;
  stock: number;
  onSuccess?: () => void;
}

/* =========================================================================
 * KOMPONEN UTAMA: AddToCartButton
 * Tombol "Add to Cart" dengan fitur:
 * - Efek hover progress bar oranye dari kiri ke kanan
 * - Cek autentikasi sebelum menambah ke keranjang
 * - Redirect ke /login jika user belum login
 * - Menampilkan modal notifikasi jika terjadi error atau belum login
 * - Tombol berubah menjadi "Sold Out" dan disabled jika stok habis
 * - Indikator loading "Processing..." saat request sedang berjalan
 * ========================================================================= */
export default function AddToCartButton({
  onSuccess,
  productId,
  productName,
  price,
  image,
  stock,
}: CartProps) {

  /* -----------------------------------------------------------------------
   * STATE
   * - loading : indikator loading saat request API add to cart berjalan
   * - modal   : konfigurasi modal notifikasi
   *   - isOpen      : kontrol visibilitas modal
   *   - message     : pesan yang ditampilkan di modal
   *   - isAuthError : true jika error disebabkan belum login (redirect ke /login saat tutup)
   * ----------------------------------------------------------------------- */
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; message: string; isAuthError: boolean }>({
    isOpen: false,
    message: "",
    isAuthError: false,
  });

  const router = useRouter();

  /* -----------------------------------------------------------------------
   * FUNGSI: closeModal
   * Menutup modal notifikasi.
   * Jika modal dibuka karena error autentikasi (isAuthError = true),
   * user akan diarahkan ke halaman /login setelah modal ditutup.
   * ----------------------------------------------------------------------- */
  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
    if (modal.isAuthError) {
      router.push("/login");
    }
  };

  /* -----------------------------------------------------------------------
   * FUNGSI: handleAddToCart
   * Menangani aksi klik tombol "Add to Cart".
   * Alur:
   * 1. Cek token di localStorage — tampilkan modal auth error jika tidak ada
   * 2. Kirim request POST ke API /cart/add dengan product_id dan jumlah = 1
   * 3. Panggil onSuccess() jika response sukses (untuk trigger modal parent)
   * 4. Tampilkan modal error jika response gagal atau terjadi error koneksi
   * ----------------------------------------------------------------------- */
  const handleAddToCart = async () => {
    const token = localStorage.getItem("access_token");

    // Cek autentikasi — redirect ke login jika token tidak ditemukan
    if (!token) {
      setModal({
        isOpen: true,
        message: "Silahkan login terlebih dahulu untuk menambah ke keranjang.",
        isAuthError: true
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(BASE_URL + `/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, jumlah: 1 }),
      });

      if (response.ok) {
        // Panggil callback onSuccess jika disediakan oleh parent
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        setModal({
          isOpen: true,
          message: error.message || "Gagal menambahkan ke keranjang.",
          isAuthError: false
        });
      }
    } catch (err) {
      setModal({ isOpen: true, message: "Terjadi kesalahan koneksi.", isAuthError: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ===================================================================
       * TOMBOL ADD TO CART
       * - Efek hover: overlay oranye (bg-amber-500) melebar dari kiri ke kanan
       * - Teks berubah warna menjadi gelap saat hover (group-hover/cart)
       * - Disabled saat stok habis (stock === 0) atau sedang loading
       * - Teks dinamis: "Processing..." | "Sold Out" | "Add to Cart"
       * =================================================================== */}
      <button
        onClick={handleAddToCart}
        disabled={stock === 0 || loading}
        className="group/cart relative w-full bg-stone-900 text-white py-4 transition-all uppercase tracking-widest text-sm font-medium disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden"
      >
        {/* Overlay progress bar oranye — melebar dari kiri ke kanan saat hover */}
        <div className="absolute inset-0 w-full h-full bg-amber-500 scale-x-0 group-hover/cart:scale-x-100 transition-transform duration-500 origin-left" />

        {/* Teks tombol — z-index 10 agar berada di atas overlay */}
        <span className="relative z-10 transition-colors duration-300 group-hover/cart:text-stone-950 font-bold">
          {loading ? (
            <span className="animate-pulse">Processing...</span>
          ) : stock === 0 ? (
            "Sold Out"
          ) : (
            "Add to Cart"
          )}
        </span>
      </button>

      {/* ===================================================================
       * MODAL NOTIFIKASI
       * Muncul saat:
       * - User belum login (isAuthError = true) → redirect ke /login saat tutup
       * - API mengembalikan error (isAuthError = false) → tutup saja
       * Berisi ikon peringatan, judul, pesan, dan tombol tutup.
       * =================================================================== */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              {/* Header modal: ikon peringatan + judul */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-stone-900">Pemberitahuan</h3>
              </div>
              {/* Pesan notifikasi */}
              <p className="text-stone-600 text-sm leading-relaxed">{modal.message}</p>
            </div>
            {/* Footer modal: tombol tutup */}
            <div className="bg-stone-50 px-6 py-4 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2 text-sm font-medium transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
