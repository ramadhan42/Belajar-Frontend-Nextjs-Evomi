"use client";

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - Link    : navigasi ke halaman detail artikel
 * - Image   : komponen gambar optimasi dari Next.js
 * - motion  : animasi fade-in saat kartu masuk ke viewport (Framer Motion)
 * ========================================================================= */
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

/* =========================================================================
 * INTERFACE: Article
 * Mendefinisikan struktur data objek artikel dari API.
 * Di-export agar dapat digunakan oleh halaman atau komponen lain.
 * - id         : ID unik artikel (string atau number)
 * - title      : judul artikel
 * - image_url  : URL gambar thumbnail (opsional, fallback ke Unsplash)
 * - slug       : kategori atau tag artikel (opsional, ditampilkan sebagai badge)
 * - created_at : tanggal publikasi dalam format ISO string
 * - author     : nama penulis (opsional, fallback ke 'Evomi Editorial')
 * - content    : isi artikel dalam format HTML (dari React Quill)
 * ========================================================================= */
export interface Article {
    id: string | number;
    title: string;
    image_url?: string;
    slug?: string;
    created_at: string;
    author?: string;
    content: string;
}

/* =========================================================================
 * INTERFACE: ArticleCardProps
 * Props yang diterima komponen ArticleCard dari parent.
 * ========================================================================= */
interface ArticleCardProps {
    article: Article;
}

/* =========================================================================
 * KOMPONEN UTAMA: ArticleCard
 * Kartu artikel untuk ditampilkan di halaman daftar artikel.
 * Fitur:
 * - Animasi fade-in + slide-up saat kartu masuk ke viewport (whileInView)
 * - Thumbnail gambar dengan efek zoom saat hover
 * - Badge slug/kategori di atas gambar (jika tersedia)
 * - Excerpt otomatis dari konten HTML (strip tag, potong 120 karakter)
 * - Tombol "Read Story" dengan animasi panah muncul saat hover
 * - Layout flex column agar tombol selalu terdorong ke bawah kartu
 * ========================================================================= */
export default function ArticleCard({ article }: ArticleCardProps) {

    /* -----------------------------------------------------------------------
     * FUNGSI: getExcerpt
     * Mengekstrak teks bersih dari konten HTML artikel dan memotongnya
     * menjadi ringkasan singkat untuk ditampilkan di kartu.
     * - Menghapus semua tag HTML menggunakan regex
     * - Mengganti entitas HTML (&nbsp;) dengan spasi
     * - Menormalisasi spasi berlebih
     * - Memotong teks pada maxLength karakter dan menambahkan "..."
     * @param htmlContent - Konten artikel dalam format HTML
     * @param maxLength   - Panjang maksimal teks excerpt (default: 120 karakter)
     * ----------------------------------------------------------------------- */
    const getExcerpt = (htmlContent: string, maxLength: number = 120) => {
        if (!htmlContent) return "";

        const plainText = htmlContent
            .replace(/<[^>]*>?/gm, ' ')  // Hapus semua tag HTML
            .replace(/&nbsp;/g, ' ')      // Ganti entitas &nbsp; dengan spasi
            .replace(/\s+/g, ' ')         // Normalisasi spasi berlebih
            .trim();

        return plainText.length > maxLength
            ? plainText.substring(0, maxLength) + "..."
            : plainText;
    };

    return (
        /* =====================================================================
         * WRAPPER KARTU
         * Animasi: opacity 0→1 + y 20→0 saat masuk viewport (once: true).
         * Layout flex column dengan h-full agar semua kartu dalam grid
         * memiliki tinggi yang sama dan tombol "Read Story" selalu di bawah.
         * ===================================================================== */
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="group cursor-pointer bg-white p-4 rounded-[2rem] border border-stone-100 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:border-stone-200 transition-all duration-500 flex flex-col h-full"
        >
            <Link href={`/artikel/${article.id}`} className="block flex-grow flex flex-col">

                {/* ---------------------------------------------------------------
                 * THUMBNAIL GAMBAR
                 * - Rasio aspek 16:10 dengan overflow hidden untuk efek zoom
                 * - Gambar zoom scale-105 saat hover (transition 1000ms)
                 * - Fallback ke gambar Unsplash jika image_url tidak tersedia
                 * - Badge slug/kategori di pojok kiri atas (hanya jika ada slug)
                 * --------------------------------------------------------------- */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-6 bg-stone-50 border border-stone-100">
                    <Image
                        src={article.image_url || "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800"}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    {/* Badge slug — hanya ditampilkan jika data slug tersedia */}
                    {article.slug && (
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                            <span className="text-[9px] font-bold tracking-widest text-stone-800 uppercase">{article.slug}</span>
                        </div>
                    )}
                </div>

                {/* ---------------------------------------------------------------
                 * KONTEN TEKS KARTU
                 * Layout flex column dengan flex-grow agar tombol "Read Story"
                 * selalu terdorong ke bagian bawah kartu.
                 * --------------------------------------------------------------- */}
                <div className="space-y-4 px-2 flex-grow flex flex-col">

                    {/* Meta info: tanggal publikasi (kiri) dan nama penulis (kanan) */}
                    <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold flex items-center gap-2">
                            {/* Dot indikator — berubah warna amber saat hover */}
                            <span className="w-2 h-2 rounded-full bg-stone-200 group-hover:bg-amber-700 transition-colors"></span>
                            {new Date(article.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <span className="text-[9px] text-stone-400 font-bold uppercase tracking-tighter italic">
                            {article.author || 'Evomi Editorial'}
                        </span>
                    </div>

                    {/* Judul artikel — berubah warna amber saat hover, max 2 baris */}
                    <h3 className="text-xl md:text-2xl text-stone-800 uppercase leading-snug group-hover:text-amber-800 transition-colors font-bold tracking-tight line-clamp-2">
                        {article.title}
                    </h3>

                    {/* Excerpt konten — teks bersih dari HTML, max 3 baris, flex-grow */}
                    <p className="text-stone-500 text-sm leading-relaxed font-light line-clamp-3 flex-grow">
                        {getExcerpt(article.content)}
                    </p>

                    {/* ---------------------------------------------------------------
                     * TOMBOL "READ STORY"
                     * mt-auto memastikan tombol selalu berada di bagian bawah kartu.
                     * Ikon panah muncul dengan animasi slide dari kiri saat hover.
                     * --------------------------------------------------------------- */}
                    <div className="pt-4 mt-auto">
                        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-stone-800 group-hover:text-amber-800 transition-all">
                            Read Story
                            {/* Ikon panah — tersembunyi (opacity-0, -translate-x-2) hingga hover */}
                            <svg className="w-4 h-4 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </div>
                </div>
            </Link>
        </motion.article>
    );
}
