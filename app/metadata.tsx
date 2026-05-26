// app/metadata.ts
// Letakkan file ini di folder app/, lalu import di layout.tsx dan setiap page

import type { Metadata } from "next";

const BASE_URL = "https://evomi-website-fronte-end-sample.vercel.app";

// ─── Metadata global (dipakai di app/layout.tsx) ───────────────────────────
export const defaultMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Evomi – Artisan Fragrance House | Parfum Lokal Premium",
    template: "%s | Evomi Fragrance",
  },
  description:
    "Evomi menghadirkan parfum artisan dengan botani langka dan teknik ekstraksi modern. Kurasi aroma eksklusif, limited batch, dari Indonesia untuk dunia.",
  keywords: [
    "parfum artisan",
    "parfum lokal Indonesia",
    "evomi fragrance",
    "wewangian eksklusif",
    "parfum premium",
    "artisan perfume",
    "parfum organik",
    "limited edition parfum",
  ],
  authors: [{ name: "Evomi Fragrance House", url: BASE_URL }],
  creator: "Evomi Fragrance House",
  publisher: "Evomi Fragrance House",

  // Open Graph — untuk preview saat dibagikan di WhatsApp, IG, dll
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: BASE_URL,
    siteName: "Evomi Fragrance House",
    title: "Evomi – Artisan Fragrance House",
    description:
      "Kurasi aroma yang melampaui waktu. Parfum artisan premium dari Indonesia.",
    images: [
      {
        url: "/img/og-image.jpg", // buat gambar 1200x630px untuk OG
        width: 1200,
        height: 630,
        alt: "Evomi Artisan Fragrance House",
      },
    ],
  },

  // Twitter/X Card
  twitter: {
    card: "summary_large_image",
    title: "Evomi – Artisan Fragrance House",
    description:
      "Kurasi aroma yang melampaui waktu. Parfum artisan premium dari Indonesia.",
    images: ["/img/og-image.jpg"],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Canonical URL
  alternates: {
    canonical: BASE_URL,
  },

  // Favicon & icons (pastikan file ada di folder public/)
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

// ─── Metadata per halaman ───────────────────────────────────────────────────

export const produkMetadata: Metadata = {
  title: "Koleksi Parfum",
  description:
    "Jelajahi koleksi parfum artisan Evomi. Dari Purpose Prestige hingga Peaceful Calm — setiap aroma dirancang untuk mendefinisikan kepribadianmu.",
  alternates: { canonical: `${BASE_URL}/produk` },
  openGraph: {
    url: `${BASE_URL}/produk`,
    title: "Koleksi Parfum | Evomi",
    description:
      "Jelajahi koleksi parfum artisan Evomi. Limited batch, botani langka.",
  },
};

// artikel meta data
export const artikelMetadata: Metadata = {
  title: "Artikel & Jurnal",
  description:
    "Pelajari dunia wewangian artisan melalui artikel dan jurnal dari Evomi — dari cara memilih parfum hingga cerita di balik setiap aroma.",
  alternates: { canonical: `${BASE_URL}/artikel` },
  openGraph: {
    url: `${BASE_URL}/artikel`,
    title: "Artikel & Jurnal | Evomi",
    description: "Dunia wewangian artisan dari perspektif Evomi.",
  },
};

// login meta data
export const loginMetadata: Metadata = {
  title: "Masuk ke Akun",
  description: "Masuk ke akun Evomi untuk melihat pesanan dan wishlist kamu.",
  robots: { index: false }, // halaman login tidak perlu diindex
};

// register meta data
export const registerMetadata: Metadata = {
  title: "Daftar Akun Baru",
  description: "Buat akun Evomi dan dapatkan akses ke koleksi eksklusif kami.",
  robots: { index: false },
};