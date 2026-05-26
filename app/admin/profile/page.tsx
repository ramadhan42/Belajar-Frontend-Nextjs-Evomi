"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, ShieldCheck, Save, Camera, LogOut } from "lucide-react";

// String global url
import { BASE_URL } from "@/src/config/strings";

// render page
export default function UserProfilePage() {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    username: "",
    email: "",
    password: "",
    image: null as File | null, // Tambahan state image
    image_url: "", // Untuk menyimpan URL gambar dari database
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null); // State untuk preview lokal
  const [loading, setLoading] = useState(true); // state for loading
  const [isUpdating, setIsUpdating] = useState(false); // state for updating
  const [message, setMessage] = useState({ type: "", text: "" }); // state for message
  const router = useRouter(); // router

  useEffect(() => {
    fetchUserData(); // fetch user data
  }, []);

  const fetchUserData = async () => { // fetch user data
    const token = localStorage.getItem("admin_access_token");
    try {
      const res = await fetch(BASE_URL + "/api/admin/me", {   // API endpoint untuk mendapatkan data admin yang sedang login
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        },
      });

      if (res.status === 401) {
        router.push('/admin-login');
        return;
      }

      const result = await res.json();
      if (result.success) {
        setFormData({
          ...result.data,
          password: "",
          image: null,
          image_url: result.data.image || "default-avatar.png" // Sesuaikan dengan field di DB kamu
        });
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk perubahan gambar (Local Preview)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file }); // set image
      setImagePreview(URL.createObjectURL(file)); // set image preview
    }
  };

  const handleUpdate = async (e: React.FormEvent) => { // handle update
    e.preventDefault();
    if (!formData.id) return;

    setIsUpdating(true); // set is updating
    setMessage({ type: "", text: "" }); // set message
    const token = localStorage.getItem("admin_access_token"); // get token

    // Gunakan FormData untuk mendukung upload file
    const data = new FormData();
    data.append('_method', 'PUT'); // Laravel membaca ini sebagai PUT
    data.append('name', formData.name); // append name
    data.append('username', formData.username); // append username
    data.append('email', formData.email); // append email

    if (formData.password) {
      data.append('password', formData.password); // append password
    }

    if (formData.image) {
      data.append('image', formData.image); // File dikirim di sini
    }

    try {
      const res = await fetch(BASE_URL + `/api/admin/users/${formData.id}`, {
        method: "POST", // Berubah jadi POST agar multipart/form-data terbaca
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          // HAPUS "Content-Type": "application/json" agar browser mengaturnya otomatis
        },
        body: data,
      });

      const result = await res.json(); // get result

      if (res.ok || result.success) { // check if success
        setMessage({ type: "success", text: "Profil berhasil diperbarui!" }); // set success message
        setFormData({ // set form data
          ...formData,
          password: "",
          image: null,
          image_url: result.data?.image || formData.image_url // Update gambar jika ada kembalian dari API
        });
      } else {
        setMessage({ type: "error", text: result.message || "Gagal memperbarui profil" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => { // handle logout
    const token = localStorage.getItem('admin_access_token'); // get token
    try {
      await fetch(BASE_URL + '/api/admin/logout', { // logout
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Gagal logout:", error);
    } finally {
      localStorage.removeItem('admin_access_token');
      router.push('/admin-login');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ===================================================================
       * KONTEN UTAMA
       * Layout grid 3 kolom:
       * - Kolom kiri (1/3)  : kartu profil dengan foto, nama, badge admin
       * - Kolom kanan (2/3) : form edit informasi pribadi dan keamanan akun
       * =================================================================== */}
      <main className="max-w-7xl mx-auto p-6 sm:p-8">

        {/* Header halaman */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Akun</h1>
          <p className="text-gray-500 mt-1">Kelola informasi profil dan keamanan akun Anda.</p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* =================================================================
           * SEKSI 1: KARTU PROFIL (KOLOM KIRI)
           * Menampilkan foto profil, nama, username, dan badge Verified Admin.
           * Foto dapat diganti dengan mengklik ikon kamera di atas foto.
           * ================================================================= */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col items-center text-center">

                {/* -------------------------------------------------------
                 * WRAPPER FOTO PROFIL
                 * Menampilkan salah satu dari tiga kondisi:
                 * 1. Preview lokal (imagePreview) — saat file baru dipilih
                 * 2. Gambar dari database (image_url) — jika bukan default
                 * 3. Inisial nama — jika gambar masih default-avatar.png
                 * ------------------------------------------------------- */}
                <div className="relative mb-4 group">
                  <div className="h-28 w-28 rounded-full border-4 border-gray-50 p-1 bg-white shadow-sm overflow-hidden flex items-center justify-center">
                    {formData.image_url !== 'default-avatar.png' ? (
                      <img
                        src={imagePreview || BASE_URL + `/storage/profiles/${formData.image_url}`}
                        alt="Profile"
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      /* Fallback inisial nama jika belum ada foto */
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-3xl font-bold border border-indigo-100">
                        {formData.name ? formData.name.charAt(0).toUpperCase() : "A"}
                      </div>
                    )}
                  </div>

                  {/* Tombol kamera — dibungkus label agar input file aktif saat diklik */}
                  <label className="absolute bottom-1 right-1 rounded-full bg-white border border-gray-200 p-2 text-gray-600 hover:text-indigo-600 hover:shadow-md transition-all cursor-pointer">
                    <Camera size={16} />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </label>
                </div>

                {/* Nama dan username admin */}
                <h3 className="text-xl font-bold text-gray-900">{formData.name}</h3>
                <p className="text-gray-500 text-sm">@{formData.username}</p>

                {/* Badge status admin terverifikasi */}
                <div className="mt-4 flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full border border-green-100">
                  <ShieldCheck size={14} />
                  Verified Admin
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================
           * SEKSI 2: FORM EDIT PROFIL (KOLOM KANAN)
           * Form dibagi menjadi dua bagian:
           * - Informasi Pribadi : nama lengkap, username, email
           * - Keamanan Akun    : password baru (opsional)
           * Notifikasi inline ditampilkan di atas form jika ada pesan.
           * ================================================================= */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

              {/* Notifikasi inline sukses/error — hanya tampil jika ada pesan */}
              {message.text && (
                <div className={`mb-6 flex items-center gap-2 rounded-xl border p-4 text-sm font-medium ${
                  message.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}>
                  <p>{message.text}</p>
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-6">

                {/* -------------------------------------------------------
                 * BAGIAN 1: INFORMASI PRIBADI
                 * - Nama lengkap (full width)
                 * - Username dan email (2 kolom berdampingan)
                 * ------------------------------------------------------- */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Informasi Pribadi</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Input nama lengkap */}
                    <div className="relative">
                      <User className="absolute left-4 top-3 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Nama Lengkap"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-800"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Input username */}
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 text-gray-400 font-bold text-sm">@</span>
                        <input
                          type="text"
                          placeholder="Username"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 outline-none focus:border-indigo-500 transition-all text-gray-800"
                          required
                        />
                      </div>
                      {/* Input email */}
                      <div className="relative">
                        <Mail className="absolute left-4 top-3 text-gray-400" size={18} />
                        <input
                          type="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all text-gray-800"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------
                 * BAGIAN 2: KEAMANAN AKUN
                 * Input password baru — opsional, kosongkan jika tidak ingin diubah.
                 * Jika diisi, password akan dikirim ke API dan diperbarui.
                 * ------------------------------------------------------- */}
                <div className="pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Keamanan Akun</h4>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3 text-gray-400" size={18} />
                    <input
                      type="password"
                      placeholder="Kata Sandi Baru (Kosongkan jika tidak diganti)"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all text-gray-800"
                    />
                  </div>
                </div>

                {/* -------------------------------------------------------
                 * TOMBOL SUBMIT
                 * Dinonaktifkan saat proses penyimpanan sedang berjalan.
                 * Teks berubah menjadi "Menyimpan..." saat isUpdating = true.
                 * ------------------------------------------------------- */}
                <div className="flex justify-end pt-6 border-t border-gray-50">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-10 py-3 font-bold text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-50"
                  >
                    {isUpdating ? "Menyimpan..." : <><Save size={18} /> Simpan Perubahan</>}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

  
