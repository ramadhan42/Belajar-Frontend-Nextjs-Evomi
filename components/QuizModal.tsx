"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Data kuis berbasis 4 opsi pilihan
const quizData = [
  {
    question: "Gimana cara kamu menghabiskan waktu luang?",
    options: ["Me-time santai di rumah", "Jalan-jalan cari inspirasi", "Eksplor tempat baru yang seru", "Datang ke acara formal/networking"],
    resultMap: { 
      "Me-time santai di rumah": "Peaceful Calm", 
      "Jalan-jalan cari inspirasi": "Sweet Shy",
      "Eksplor tempat baru yang seru": "Rabel Brave",
      "Datang ke acara formal/networking": "Purpose Prestige"
    }
  },
  {
    question: "Gaya pakaian (outfit) andalan kamu?",
    options: ["Minimalis & Clean", "Girly atau Korean Style", "Streetwear atau Edgy", "Elegant & Classy"],
    resultMap: { 
      "Minimalis & Clean": "Peaceful Calm", 
      "Girly atau Korean Style": "Sweet Shy",
      "Streetwear atau Edgy": "Rabel Brave",
      "Elegant & Classy": "Purpose Prestige"
    }
  },
  {
    question: "Vibe apa yang paling menggambarkan dirimu?",
    options: ["Tenang & Dewasa", "Ceria & Friendly", "Cool & Misterius", "Karismatik & Profesional"],
    resultMap: { 
      "Tenang & Dewasa": "Peaceful Calm", 
      "Ceria & Friendly": "Sweet Shy",
      "Cool & Misterius": "Rabel Brave",
      "Karismatik & Profesional": "Purpose Prestige"
    }
  },
  {
    question: "Tipe wangi yang paling kamu suka?",
    options: ["Soft & Powdery", "Sweet & Gourmand", "Strong & Spicy", "Fresh & Luxury"],
    resultMap: { 
      "Soft & Powdery": "Peaceful Calm", 
      "Sweet & Gourmand": "Sweet Shy",
      "Strong & Spicy": "Rabel Brave",
      "Fresh & Luxury": "Purpose Prestige"
    }
  }
];

// Mapping gambar produk berdasarkan hasil
const productImages: Record<string, string> = {
  "Purpose Prestige": "https://ramadhan.alwaysdata.net/storage/new products/gemini - purpose prestige.png",
  "Peaceful Calm": "https://ramadhan.alwaysdata.net/storage/new products/gemini - peaceful calm.png",
  "Rabel Brave": "https://ramadhan.alwaysdata.net/storage/new products/gemini - sweet shy.png",
  "Sweet Shy": "https://ramadhan.alwaysdata.net/storage/new products/gemini - rabel brave.png"
};

export default function QuizModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  const [userChoices, setUserChoices] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  // reset quiz function
  const resetQuiz = () => {
    setCurrent(0);
    setUserChoices([]);
    setFinished(false);
  };

  // handle answer function
  const handleAnswer = (opt: string) => {
    setUserChoices([...userChoices, opt]);
    if (current + 1 < quizData.length) {
      setCurrent(current + 1);
    } else {
      setFinished(true);
    }
  };

  // get result function
  const getResult = () => {
    const counts: Record<string, number> = {};
    userChoices.forEach((choice, index) => {
      const resultMap = quizData[index].resultMap;
      const type = resultMap[choice as keyof typeof resultMap];
      if (type) {
        counts[type] = (counts[type] || 0) + 1;
      }
    });
    return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
  };

  const finalResult = finished ? getResult() : "";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 m-auto z-[201] w-[90%] max-w-md h-fit max-h-[90vh] overflow-y-auto bg-white p-8 rounded-3xl shadow-2xl"
          >
            {!finished ? (
              <div className="text-center">
                <h3 className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-6">Quiz Evomi</h3>
                <p className="font-bold text-xl mb-8">{quizData[current].question}</p>
                <div className="grid grid-cols-1 gap-3">
                  {quizData[current].options.map(opt => (
                    <button 
                      key={opt} 
                      onClick={() => handleAnswer(opt)} 
                      className="w-full py-3 px-4 border border-stone-200 hover:bg-stone-900 hover:text-white transition-all uppercase text-[10px] tracking-widest font-bold"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <h3 className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">Tipe Kamu Adalah</h3>
                <h2 className="text-3xl font-bold mb-6 text-stone-900">{finalResult}</h2>
                
                {/* Image Produk Dinamis */}
                {/* <div className="relative w-48 h-48 mx-auto mb-6 drop-shadow-xl">
                  <Image
                    src={productImages[finalResult]}
                    alt={finalResult}
                    fill
                    className="object-contain"
                    priority
                  />
                </div> */}

                <p className="text-stone-500 text-sm mb-8 leading-relaxed px-4">
                  Aroma ini sangat mencerminkan karaktermu yang unik. Siap meningkatkan rasa percaya dirimu?
                </p>

                <div className="bg-stone-50 p-6 rounded-2xl mb-8 border border-stone-100">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-stone-900 mb-4">
                    Order di Official Store:
                  </p>
                  <div className="flex flex-col gap-3">
                    {/* Button Tokopedia */}
                    <a 
                      href="https://www.tokopedia.com/toko-evomi" 
                      target="_blank" 
                      className="flex items-center justify-center gap-3 w-full py-3 bg-white border border-stone-200 hover:border-stone-900 transition-all rounded-xl shadow-sm"
                    >
                      {/* <Image src="https://ramadhan.alwaysdata.net/storage/toko online/tokopedia.png" alt="Tokopedia" width={18} height={18} /> */}
                      <span className="uppercase text-[10px] tracking-widest font-bold text-stone-700">Tokopedia</span>
                    </a>
                    
                    {/* Button Shopee */}
                    <a 
                      href="https://shopee.co.id/toko-evomi" 
                      target="_blank" 
                      className="flex items-center justify-center gap-3 w-full py-3 bg-white border border-stone-200 hover:border-stone-900 transition-all rounded-xl shadow-sm"
                    >
                      {/* <Image src="https://ramadhan.alwaysdata.net/storage/toko online/shopee.png" alt="Shopee" width={18} height={18} /> */}
                      <span className="uppercase text-[10px] tracking-widest font-bold text-stone-700">Shopee</span>
                    </a>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button onClick={resetQuiz} className="w-full py-3 border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white transition-all uppercase text-[10px] tracking-widest font-bold">Ulangi Quiz</button>
                  <button onClick={onClose} className="w-full py-3 bg-stone-900 text-white uppercase text-[10px] tracking-widest font-bold">Tutup</button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
