"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}: ModalProps) {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed inset-0 m-auto z-[201] w-[90%] ${sizes[size]} h-fit max-h-[90vh] overflow-y-auto bg-white p-8 rounded-3xl shadow-2xl`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              {title && (
                <h2 className="text-2xl font-bold text-stone-900">{title}</h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-stone-400 hover:text-stone-900 transition-colors ml-auto"
                >
                  <X size={24} />
                </button>
              )}
            </div>

            {/* Content */}
            <div>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
