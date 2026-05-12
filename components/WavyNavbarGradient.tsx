"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Komponen WavyNavbarGradient
 * Memberikan efek gelombang beranimasi yang seamless untuk diletakkan di bawah Navbar.
 */
const WavyNavbarGradient = () => {
  return (
    <div className="absolute inset-x-0 bottom-0 h-6 overflow-hidden -mb-px z-10 pointer-events-none">
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0 w-[200%] h-full animate-wave-horizontal"
        preserveAspectRatio="none"
      >
        {/* Path Pertama */}
        <motion.path
          animate={{
            d: [
              "M0,80 C240,95 480,65 720,80 C960,95 1200,65 1440,80 L1440,120 L0,120 Z",
              "M0,80 C240,65 480,95 720,80 C960,65 1200,95 1440,80 L1440,120 L0,120 Z",
              "M0,80 C240,95 480,65 720,80 C960,95 1200,65 1440,80 L1440,120 L0,120 Z",
            ],
          }}
          transition={{
            duration: 10,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          fill="url(#waveGradient)"
        />

        {/* Path Kedua (Penyambung) */}
        <motion.path
          animate={{
            d: [
              "M1440,80 C1680,95 1920,65 2160,80 C2400,95 2640,20 2880,80 L2880,120 L1440,120 Z",
              "M1440,80 C1680,65 1920,95 2160,80 C2400,65 2640,95 2880,80 L2880,120 L1440,120 Z",
              "M1440,80 C1680,95 1920,65 2160,80 C2400,95 2640,20 2880,80 L2880,120 L1440,120 Z",
            ],
          }}
          transition={{
            duration: 10,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          fill="url(#waveGradient)"
        />

        <defs>
          <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#005fa3" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0071bc" />
          </linearGradient>
        </defs>
      </svg>

      <style jsx global>{`
        @keyframes wave-move-seamless {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-wave-horizontal {
          animation: wave-move-seamless 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default WavyNavbarGradient;