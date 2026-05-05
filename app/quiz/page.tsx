"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// TODO: Add discount logic here
const quizData = [
    { question: "Parfum manakah yang paling cocok untuk acara formal?", options: ["Purpose Prestige", "Peaceful Calm"], answer: "Purpose Prestige" },
    { question: "Aroma manakah yang memberikan kesan tenang untuk sehari-hari?", options: ["Peaceful Calm", "Rabel Brave"], answer: "Peaceful Calm" },
    { question: "Untuk kamu yang berani tampil beda, aroma apa yang cocok?", options: ["Sweet Shy", "Rabel Brave"], answer: "Rabel Brave" },
    { question: "Parfum mana yang menonjolkan sisi manis namun tetap elegan?", options: ["Sweet Shy", "Purpose Prestige"], answer: "Sweet Shy" },
];

// TODO: Add discount logic here
export default function QuizPage() {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    // handle answer
    const handleAnswer = (option: string) => {
        if (option === quizData[currentQuestion].answer) setScore(score + 25);

        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < quizData.length) {
            setCurrentQuestion(nextQuestion);
        } else {
            setShowResult(true);
        }
    };

    // TODO: Add discount logic here
    return (
        <div className="min-h-screen bg-[#0071bc] py-20 px-6 flex items-center justify-center">
            {!showResult ? (
                <div className="max-w-xl w-full text-center bg-white p-10 md:p-12 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.1)]">
                    <h1 className="text-2xl font-bold uppercase tracking-widest mb-10 text-[#0071bc]">Temukan Aroma Evomi Kamu</h1>
                    <motion.div key={currentQuestion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <p className="text-lg mb-8 text-[#0071bc] font-medium">{quizData[currentQuestion].question}</p>
                        <div className="grid gap-4">
                            {quizData[currentQuestion].options.map((opt) => (
                                <button 
                                    key={opt} 
                                    onClick={() => handleAnswer(opt)} 
                                    className="p-4 border-2 border-[#0071bc] text-[#0071bc] hover:bg-[#0071bc] hover:text-white rounded-2xl transition-all uppercase text-[12px] tracking-widest font-bold"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div className="max-w-xl w-full text-center bg-white p-10 md:p-12 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.1)]">
                    <h2 className="text-4xl font-bold mb-4 text-[#0071bc]">Quiz Selesai!</h2>
                    <p className="text-xl text-[#0071bc] font-medium">Skor Anda: {score} / 100</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-8 px-8 py-4 bg-[#0071bc] hover:bg-[#005a96] text-white rounded-2xl uppercase text-[12px] font-bold tracking-widest transition-all shadow-lg shadow-[#0071bc]/30"
                    >
                        Ulangi Kuis
                    </button>
                </div>
            )}
        </div>
    );
}