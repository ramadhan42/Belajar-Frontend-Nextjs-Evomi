"use client";

/* =========================================================================
 * IMPORT DEPENDENCIES
 * - Swiper & SwiperSlide : komponen carousel dari library Swiper.js
 * - Autoplay             : modul Swiper untuk auto-play slide otomatis
 * - Pagination           : modul Swiper untuk bullet navigasi di bawah slide
 * - Navigation           : modul Swiper untuk tombol panah kiri/kanan
 * - Image                : komponen gambar optimasi dari Next.js
 * ========================================================================= */
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Image from 'next/image';

/* =========================================================================
 * DATA: posters
 * Array data statis untuk setiap slide poster.
 * - id  : ID unik slide
 * - src : path gambar dari folder /public/images
 * - alt : teks alternatif untuk aksesibilitas
 * ========================================================================= */
const posters = [
  { id: 1, src: '/images/poster1.jpg', alt: 'Promo Spesial 1' },
  { id: 2, src: '/images/poster2.jpg', alt: 'Koleksi Terbaru' },
  { id: 3, src: '/images/poster3.jpg', alt: 'Diskon Musim Ini' },
];

/* =========================================================================
 * KOMPONEN UTAMA: PosterSlider
 * Slider poster promosi menggunakan Swiper.js dengan fitur:
 * - Auto-play setiap 4 detik (tidak berhenti saat interaksi)
 * - Bullet pagination yang dapat diklik (dynamic bullets)
 * - Tombol navigasi panah kiri/kanan
 * - Rasio aspek responsif: 16:9 di mobile, 21:9 di desktop
 * - Overlay tipis di atas gambar untuk estetika
 * - Custom CSS global untuk styling tombol dan bullet Swiper
 * ========================================================================= */
const PosterSlider = () => {
  return (
    <section className="w-full py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">

        {/* =================================================================
         * SWIPER CAROUSEL
         * Konfigurasi:
         * - spaceBetween    : jarak antar slide (20px)
         * - centeredSlides  : slide aktif selalu di tengah
         * - autoplay.delay  : interval auto-play 4000ms
         * - disableOnInteraction: false → auto-play tidak berhenti saat diklik
         * - pagination.clickable: bullet dapat diklik untuk navigasi langsung
         * - dynamicBullets  : bullet aktif lebih besar dari yang tidak aktif
         * ================================================================= */}
        <Swiper
          spaceBetween={20}
          centeredSlides={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="rounded-2xl overflow-hidden shadow-lg border border-gray-100"
        >
          {/* ---------------------------------------------------------------
           * SLIDE ITEM
           * Setiap poster dirender sebagai SwiperSlide.
           * Rasio aspek: 16:9 di mobile, 21:9 (sinematik) di desktop.
           * Overlay bg-black/5 ditambahkan untuk kesan estetika premium.
           * --------------------------------------------------------------- */}
          {posters.map((poster) => (
            <SwiperSlide key={poster.id}>
              <div className="relative aspect-[16/9] md:aspect-[21/9] w-full">
                <Image
                  src={poster.src}
                  alt={poster.alt}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Overlay tipis untuk estetika */}
                <div className="absolute inset-0 bg-black/5" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* =====================================================================
       * CUSTOM CSS GLOBAL SWIPER
       * Override styling default Swiper untuk menyesuaikan dengan desain Evomi:
       * - Tombol panah: background putih transparan + backdrop blur + border
       * - Ukuran ikon panah diperkecil (18px) dan ditebalkan
       * - Bullet aktif: warna hitam (#000) menggantikan warna default Swiper
       * ===================================================================== */}
      <style jsx global>{`
        .swiper-button-next, .swiper-button-prev {
          color: #000;
          background: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(8px);
          width: 45px;
          height: 45px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 18px;
          font-weight: bold;
        }
        .swiper-pagination-bullet-active {
          background: #000 !important;
        }
      `}</style>
    </section>
  );
};

export default PosterSlider;
