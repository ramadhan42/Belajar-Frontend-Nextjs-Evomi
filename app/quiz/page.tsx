"use client";

import { useState } from "react";
import Link from "next/link";
import localFont from "next/font/local";
import { motion, AnimatePresence } from "framer-motion";

// Font lokal disesuaikan dengan setup Evomi Anda
const fontJudul = localFont({
  src: "../fonts/8 Heavy.ttf", // Sesuaikan path font lokal Anda jika berbeda
  variable: "--font-brand-judul",
});

// --- DATA KUIS ---
interface Option {
  text: string;
  desc: string;
  icon: string;
  points: { [key: string]: number };
}

interface Question {
  id: number;
  title: string;
  subtitle: string;
  options: Option[];
}

const quizQuestions: Question[] = [
  {
    id: 1,
    title: "Gaya Hidup & Rutinitas",
    subtitle: "Bagaimana Anda menghabiskan waktu luang yang berharga?",
    options: [
      {
        text: "Quiet Home",
        desc: "Me-time santai, menikmati ketenangan di dalam ruang pribadi.",
        icon: "✨",
        points: { "Peaceful Calm": 3, "Purpose Prestige": 1 },
      },
      {
        text: "Exploration",
        desc: "Mencari inspirasi baru di sudut kota atau alam terbuka.",
        icon: "🧭",
        points: { "Rabel Brave": 3, "Peaceful Calm": 1 },
      },
      {
        text: "Networking",
        desc: "Menghadiri acara formal, membangun koneksi, dan produktif.",
        icon: "💼",
        points: { "Purpose Prestige": 3, "Rabel Brave": 1 },
      },
      {
        text: "Cozy & Creative",
        desc: "Bersantai di kafe yang tenang, membaca buku, atau melakukan hobi kreatif.",
        icon: "☕",
        points: { "Sweet Shy": 3, "Peaceful Calm": 1 }, // Poin untuk Sweet Shy
      },
    ],
  },
  {
    id: 2,
    title: "Ekspresi Visual",
    subtitle: "Pilih suasana yang paling mendeskripsikan gaya berpakaian Anda.",
    options: [
      {
        text: "Minimalist",
        desc: "Warna netral, potongan bersih, fungsional, dan subtle.",
        icon: "🖤",
        points: { "Peaceful Calm": 3, "Purpose Prestige": 1 },
      },
      {
        text: "Effortless Bold",
        desc: "Eksperimental, berani tampil beda, dan berkarakter kuat.",
        icon: "🔥",
        points: { "Rabel Brave": 3 },
      },
      {
        text: "Elegant Luxury",
        desc: "Rapi, berwibawa, profesional, dan berkelas.",
        icon: "🏛️",
        points: { "Purpose Prestige": 3, "Rabel Brave": 1 },
      },
      {
        text: "Soft & Feminine",
        desc: "Warna pastel, sentuhan floral, bahan yang lembut dan manis.",
        icon: "🌸",
        points: { "Sweet Shy": 3 }, // Poin untuk Sweet Shy
      },
    ],
  },
  {
    id: 3,
    title: "Manifestasi Karakter",
    subtitle: "Aura atau impresi apa yang paling ingin Anda pancarkan?",
    options: [
      {
        text: "Misterius & Intense",
        desc: "Vibe yang cool, sedikit tertutup, namun sangat memikat.",
        icon: "🌙",
        points: { "Rabel Brave": 3 },
      },
      {
        text: "Tenang & Dewasa",
        desc: "Pembawaan yang damai, bijak, dan menenangkan.",
        icon: "🍃",
        points: { "Peaceful Calm": 3 },
      },
      {
        text: "Karismatik & Pemimpin",
        desc: "Penuh percaya diri, berambisi, dan memegang kendali.",
        icon: "👑",
        points: { "Purpose Prestige": 3 },
      },
      {
        text: "Manis & Hangat",
        desc: "Pembawaan yang pemalu, lembut, namun penuh kehangatan.",
        icon: "🎀",
        points: { "Sweet Shy": 3 }, // Poin untuk Sweet Shy
      },
    ],
  },
];

// --- DATA PRODUK MATCH (GRADIEN DIUBAH KE VERSI TERANG) ---
interface ProductMatch {
  nama: string;
  tagline: string;
  deskripsi: string;
  vibe: string;
  moment: string;
  sillage: string;
  bgGradient: string;
}

const productData: { [key: string]: ProductMatch } = {
  "Peaceful Calm": {
    nama: "Peaceful Calm",
    tagline: "Ketenangan Abadi yang Subtle",
    deskripsi:
      "Aroma yang dirancang untuk Anda yang menghargai kedamaian. Memadukan notes Soft & Powdery yang memberikan kesan bersih, dewasa, dan menenangkan sepanjang hari.",
    vibe: "Tenang, Bersih & Dewasa",
    moment: "Self-care, Work from Home, Casual Read",
    sillage: "Intimate & Sophisticated",
    bgGradient: "from-teal-50 to-white",
  },
  "Rabel Brave": {
    nama: "Rabel Brave",
    tagline: "Keberanian Tak Terbatas",
    deskripsi:
      "Bagi jiwa petualang yang tidak takut mencuri perhatian. Dengan sentuhan Strong & Spicy, aroma ini memancarkan aura cool, misterius, dan penuh energi malam.",
    vibe: "Cool, Bold & Intense",
    moment: "Night Out, Concert, Late Travel",
    sillage: "Powerful & Long-lasting",
    bgGradient: "from-purple-50 to-white",
  },
  "Purpose Prestige": {
    nama: "Purpose Prestige",
    tagline: "Otoritas & Elegansi Mutlak",
    deskripsi:
      "Karakter profesional yang karismatik tercermin dalam notes Fresh & Luxury. Mewakili kemewahan yang subtle namun berwibawa di setiap langkah.",
    vibe: "Karismatik, Mewah & Profesional",
    moment: "Business Meeting, Gala Dinner, Formal Events",
    sillage: "Elegant & Memorable Trail",
    bgGradient: "from-amber-50 to-white",
  },
  "Sweet Shy": {
    nama: "Sweet Shy",
    tagline: "Kelembutan Manis yang Memikat",
    deskripsi:
      "Aroma manis dan lembut untuk Anda yang memiliki karakter pemalu namun penuh kehangatan. Sentuhan Floral dan Fruity yang ringan meninggalkan kesan innocent dan romantis.",
    vibe: "Manis, Lembut & Romantis",
    moment: "First Date, Piknik, Casual Hangout",
    sillage: "Soft & Intimate",
    bgGradient: "from-rose-50 to-white", // Gradien pink pastel ke putih
  },
};

// --- VARIANT ANIMASI ---
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.4, ease: "easeIn" as const },
  },
};

export default function QuizPage() {
  const [step, setStep] = useState<
    "start" | "questions" | "calculating" | "result"
  >("start");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState<{ [key: string]: number }>({
    "Peaceful Calm": 0,
    "Rabel Brave": 0,
    "Purpose Prestige": 0,
  });
  const [finalMatch, setFinalMatch] = useState<ProductMatch | null>(null);

  const startQuiz = () => {
    setScores({ "Peaceful Calm": 0, "Rabel Brave": 0, "Purpose Prestige": 0 });
    setCurrentQuestionIndex(0);
    setStep("questions");
  };

  const handleOptionSelect = (points: { [key: string]: number }) => {
    const newScores = { ...scores };
    Object.keys(points).forEach((key) => {
      newScores[key] = (newScores[key] || 0) + points[key];
    });
    setScores(newScores);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setStep("calculating");
      setTimeout(() => {
        let winner = "Peaceful Calm";
        let maxScore = -1;

        Object.keys(newScores).forEach((key) => {
          if (newScores[key] > maxScore) {
            maxScore = newScores[key];
            winner = key;
          }
        });

        setFinalMatch(productData[winner]);
        setStep("result");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white text-stone-900 flex flex-col justify-between overflow-hidden relative selection:bg-amber-500/30">
      {/* HEADER NAVBAR KECIL */}
      <header className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full border-b border-stone-200">
        <Link
          href="/"
          className={`${fontJudul.className} text-xl md:text-2xl tracking-widest text-stone-900 hover:text-amber-500 transition-colors uppercase`}
        >
          EVOMI
        </Link>
        <Link
          href="/"
          className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-stone-500 hover:text-stone-900 border-b border-stone-300 hover:border-stone-500 pb-0.5 transition-all"
        >
          Kembali ke Beranda
        </Link>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-grow flex items-center justify-center px-4 md:px-8 py-12 relative z-10 w-full max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {/* 1. START STATE */}
          {step === "start" && (
            <motion.div
              key="start-screen"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center max-w-2xl space-y-8"
            >
              <div className="space-y-4">
                <span className="text-amber-500 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold block">
                  The Evomi Experience
                </span>
                <h1
                  className={`${fontJudul.className} text-4xl md:text-6xl text-stone-900 leading-tight uppercase`}
                >
                  Unveil Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 italic">
                    Essence
                  </span>
                </h1>
              </div>
              <p className="text-stone-600 text-sm md:text-base leading-relaxed font-light max-w-lg mx-auto">
                Sebuah perjalanan sensorik singkat untuk menemukan karakter
                wewangian yang paling memanifestasikan jati diri dan energi
                Anda.
              </p>
              <div className="pt-4">
                <button
                  onClick={startQuiz}
                  className="bg-stone-900 hover:bg-amber-500 text-white font-bold text-xs md:text-sm uppercase tracking-widest py-4 px-10 rounded-full transition-all duration-300 shadow-xl shadow-stone-200 hover:scale-105"
                >
                  Mulai Pencarian Scent
                </button>
              </div>
            </motion.div>
          )}

          {/* 2. QUESTIONS STATE */}
          {step === "questions" && (
            <motion.div
              key={`question-${currentQuestionIndex}`}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-10"
            >
              {/* Progress Tracker */}
              <div className="flex justify-between items-center max-w-md mx-auto">
                <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">
                  Pertanyaan {currentQuestionIndex + 1} dari{" "}
                  {quizQuestions.length}
                </span>
                <div className="w-32 bg-stone-200 h-[2px] rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-500"
                    style={{
                      width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Teks Soal */}
              <div className="text-center space-y-3">
                <span className="text-xs uppercase font-medium tracking-[0.2em] text-stone-500">
                  {quizQuestions[currentQuestionIndex].title}
                </span>
                <h2 className="text-xl md:text-3xl font-light text-stone-900 max-w-2xl mx-auto leading-snug">
                  {quizQuestions[currentQuestionIndex].subtitle}
                </h2>
              </div>

              {/* Opsi Jawaban */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-4xl mx-auto pt-4">
                {quizQuestions[currentQuestionIndex].options.map(
                  (option, i) => (
                    <button
                      key={i}
                      onClick={() => handleOptionSelect(option.points)}
                      className="group bg-white hover:bg-stone-50 border border-stone-200 hover:border-amber-500 p-6 md:p-8 text-left rounded-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between items-start space-y-6 shadow-sm hover:shadow-md"
                    >
                      <div className="text-3xl bg-stone-50 p-3 rounded-xl border border-stone-100 group-hover:scale-110 transition-transform duration-300">
                        {option.icon}
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-stone-900 text-base md:text-lg">
                          {option.text}
                        </h3>
                        <p className="text-stone-600 text-xs leading-relaxed font-light">
                          {option.desc}
                        </p>
                      </div>
                    </button>
                  ),
                )}
              </div>
            </motion.div>
          )}

          {/* 3. CALCULATING STATE */}
          {step === "calculating" && (
            <motion.div
              key="calculating-screen"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center space-y-6"
            >
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full" />
                <div className="absolute inset-0 border-2 border-t-amber-500 rounded-full animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium tracking-wide uppercase text-stone-800 animate-pulse">
                  Menganalisis Intuisi Anda
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Algoritma Evomi sedang memetakan kecocokan partikel aroma
                  organik dengan karakter Anda...
                </p>
              </div>
            </motion.div>
          )}

          {/* 4. RESULT STATE */}
          {step === "result" && finalMatch && (
            <motion.div
              key="result-screen"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`w-full max-w-4xl bg-gradient-to-b ${finalMatch.bgGradient} border border-stone-200 rounded-3xl p-8 md:p-14 shadow-2xl shadow-stone-200/50 relative overflow-hidden`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center relative z-10">
                <div className="md:col-span-7 space-y-6 text-left">
                  <div className="space-y-2">
                    <span className="text-[10px] md:text-xs text-amber-500 uppercase tracking-[0.25em] font-bold block">
                      Aromatic Alignment Match
                    </span>
                    <h2
                      className={`${fontJudul.className} text-3xl md:text-5xl uppercase tracking-tight text-stone-900 leading-none`}
                    >
                      {finalMatch.nama}
                    </h2>
                    <p className="text-sm font-medium italic text-stone-600">
                      &ldquo;{finalMatch.tagline}&rdquo;
                    </p>
                  </div>

                  <p className="text-stone-600 text-sm leading-relaxed font-light">
                    {finalMatch.deskripsi}
                  </p>

                  {/* Atribut Meta Varian */}
                  <div className="pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-stone-400 uppercase tracking-wider text-[10px] font-semibold">
                        Vibe Aura
                      </span>
                      <p className="text-stone-800 font-medium">
                        {finalMatch.vibe}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-stone-400 uppercase tracking-wider text-[10px] font-semibold">
                        Momen Sempurna
                      </span>
                      <p className="text-stone-800 font-medium">
                        {finalMatch.moment}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-stone-400 uppercase tracking-wider text-[10px] font-semibold">
                        Sillage
                      </span>
                      <p className="text-stone-800 font-medium">
                        {finalMatch.sillage}
                      </p>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/produk"
                      className="bg-stone-900 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-widest py-3.5 px-8 rounded-xl text-center transition-all duration-300 shadow-lg"
                    >
                      Belanja Koleksi Ini
                    </Link>
                    <button
                      onClick={startQuiz}
                      className="bg-white border border-stone-300 hover:border-stone-500 text-stone-600 hover:text-stone-900 font-bold text-xs uppercase tracking-widest py-3.5 px-8 rounded-xl transition-all duration-300"
                    >
                      Ulangi Kuis
                    </button>
                  </div>
                </div>

                {/* Bagian Visual Kanan Placeholder Botol/Karakter */}
                <div className="md:col-span-5 flex justify-center">
                  <div className="w-full aspect-[4/5] max-w-[280px] bg-white rounded-2xl border border-stone-200 shadow-xl flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="text-6xl animate-bounce duration-[3000ms]">
                      🧪
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                        Kadar Kecocokan
                      </p>
                      <h4
                        className={`${fontJudul.className} text-3xl text-stone-800`}
                      >
                        100%
                      </h4>
                    </div>
                    <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                      Sifat kimiawi notes ini akan menyatu harmonis dengan
                      temperatur tubuh Anda.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER KECIL */}
      <footer className="relative z-10 py-6 text-center text-[10px] text-stone-400 font-medium uppercase tracking-[0.2em] border-t border-stone-200 w-full">
        &copy; {new Date().getFullYear()} EVOMI FRAGRANCE HOUSE
      </footer>
    </div>
  );
}
