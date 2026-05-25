"use client";

// components/TestimonialSection.tsx
import { useState, useEffect } from "react";

type Testimonial = {
  id: number;
  name: string;
  product: string;
  text: string;
  rating: number;
  initials: string;
  color: string;
};

// Data ditambah menjadi 4
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Clara S.",
    product: "Peaceful Calm",
    text: "Peaceful Calm adalah aroma paling segar yang pernah saya miliki. Menyatu sempurna dengan kulit dan bertahan sepanjang hari.",
    rating: 5,
    initials: "CS",
    color: "#2D4A3E",
  },
  {
    id: 2,
    name: "Dimas R.",
    product: "Rabel Brave",
    text: "Rabel Brave sangat memikat perhatian di malam hari. Projection-nya luar biasa tahan lama — banyak yang bertanya saya pakai parfum apa.",
    rating: 5,
    initials: "DR",
    color: "#3A2D4A",
  },
  {
    id: 3,
    name: "Sarah W.",
    product: "Purpose Prestige",
    text: "Packaging Evomi sangat mewah, benar-benar brand berkelas internasional dari lokal. Purpose Prestige jadi favorit koleksi saya.",
    rating: 5,
    initials: "SW",
    color: "#4A2D2D",
  },
  {
    id: 4,
    name: "Bagas P.",
    product: "Midnight Oud",
    text: "Aromanya sangat berkarakter dan maskulin. Cocok untuk acara formal, wanginya memberikan kesan elegan dan misterius yang tahan lama.",
    rating: 5,
    initials: "BP",
    color: "#1F2937",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill={i < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          className={i < rating ? "text-amber-400" : "text-neutral-500"}
        >
          <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.885l-3.09 1.625.59-3.44L2 4.635l3.455-.505L7 1z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialSection() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Auto-rotate setiap 5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      goNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [active]);

  const goTo = (index: number) => {
    if (animating || index === active) return;
    setAnimating(true);
    setTimeout(() => {
      setActive(index);
      setAnimating(false);
    }, 300);
  };

  const goNext = () => {
    goTo((active + 1) % testimonials.length);
  };

  const goPrev = () => {
    goTo((active - 1 + testimonials.length) % testimonials.length);
  };

  // Mengambil 2 testimonial sekaligus (item saat ini dan item berikutnya)
  const visibleTestimonials = [
    testimonials[active],
    testimonials[(active + 1) % testimonials.length],
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background dekoratif */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-neutral-900/40 blur-3xl" />
      </div>

      {/* Heading */}
      <div className="text-center mb-16">
        <p className="text-xs tracking-[0.3em] text-neutral-500 uppercase mb-3">
          Testimonial
        </p>
        <h2 className="text-3xl md:text-4xl font-light text-stone-800 italic">
          &ldquo;Captured in a scent,
          <br />
          defined by the soul.&rdquo;
        </h2>
      </div>

      {/* Container diperlebar ke max-w-5xl agar muat 2 card */}
      <div className="max-w-5xl mx-auto">
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(8px)" : "translateY(0)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          {visibleTestimonials.map((t, idx) => (
            <div
              key={`${t.id}-${active}`} // Memaksa re-render animasi yang halus
              // Card kedua disembunyikan di mobile agar tidak terlalu panjang ke bawah
              className={`relative bg-neutral-900 border border-neutral-800 rounded-2xl p-8 md:p-10 flex flex-col justify-between ${
                idx === 1 ? "hidden md:flex" : "flex"
              }`}
            >
              <div>
                {/* Quote icon */}
                <svg
                  className="absolute top-8 right-8 text-neutral-700 opacity-60"
                  width="40"
                  height="32"
                  viewBox="0 0 40 32"
                  fill="currentColor"
                >
                  <path d="M0 32V19.2C0 8.533 5.333 2.4 16 0l2.4 4C13.067 5.333 10.133 8.267 9.6 12.8H16V32H0zm24 0V19.2C24 8.533 29.333 2.4 40 0l2.4 4c-5.333 1.333-8.267 4.267-8.8 8.8H40V32H24z" />
                </svg>

                <StarRating rating={t.rating} />

                <blockquote className="mt-6 mb-8 text-lg text-neutral-200 leading-relaxed font-light">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: t.color }}
                >
                  <span className="text-sm font-medium text-white tracking-wide">
                    {t.initials}
                  </span>
                </div>
                <div>
                  {/* Warna diubah ke text-neutral-100 agar kontras dengan background gelap */}
                  <p className="text-neutral-100 font-medium">{t.name}</p>
                  <p className="text-neutral-500 text-sm">Pembeli {t.product}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigasi dibatasi max-w-2xl agar panah tidak terlalu menjauh di pinggir layar */}
        <div className="flex items-center justify-between mt-10 px-2 max-w-2xl mx-auto">
          {/* Tombol prev */}
          <button
            onClick={goPrev}
            aria-label="Testimonial sebelumnya"
            className="w-10 h-10 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Testimonial ${i + 1}`}
                className="transition-all duration-300"
                style={{
                  width: i === active ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  backgroundColor:
                    i === active
                      ? "rgb(212, 212, 212)"
                      : "rgb(64, 64, 64)",
                }}
              />
            ))}
          </div>

          {/* Tombol next */}
          <button
            onClick={goNext}
            aria-label="Testimonial berikutnya"
            className="w-10 h-10 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Counter kecil */}
        <p className="text-center text-neutral-600 text-xs mt-4 tracking-widest">
          {String(active + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
        </p>
      </div>
    </section>
  );
}