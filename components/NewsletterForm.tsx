"use client";

// components/NewsletterForm.tsx
// Ganti form newsletter yang ada dengan komponen ini

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const validateEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setErrorMsg("Masukkan alamat email yang valid.");
      return;
    }

    setErrorMsg("");
    setStatus("loading");

    try {
      // Ganti URL ini dengan endpoint Laravel kamu
      // Contoh: await fetch("https://api.evomi.com/newsletter", { method: "POST", body: JSON.stringify({ email }) })
      await new Promise((res) => setTimeout(res, 1200)); // simulasi request

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMsg("Terjadi kesalahan. Coba lagi nanti.");
    }
  };

  const reset = () => {
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* State: success */}
      {status === "success" ? (
        <div className="text-center py-6 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-900/50 border border-emerald-700 flex items-center justify-center mx-auto mb-4">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-emerald-400"
            >
              <path
                d="M4 10l4 4 8-8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-neutral-200 font-medium mb-1">
            Terima kasih telah mendaftar!
          </p>
          <p className="text-neutral-500 text-sm mb-4">
            Kamu akan mendapat notifikasi rilis terbaru Evomi.
          </p>
          <button
            onClick={reset}
            className="text-xs text-neutral-500 underline underline-offset-4 hover:text-neutral-300 transition-colors"
          >
            Daftar dengan email lain
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <p className="text-xs tracking-[0.25em] text-neutral-500 uppercase mb-3 text-center">
            The Newsletter
          </p>
          <p className="text-neutral-300 text-sm text-center mb-6">
            Dapatkan akses eksklusif ke rilis terbaru kami.
          </p>

          {/* Input + button */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="alamat@email.com"
                disabled={status === "loading"}
                className={`
                  w-full bg-neutral-900 border rounded-lg px-4 py-3 text-sm text-neutral-100
                  placeholder:text-neutral-600 outline-none transition-all
                  disabled:opacity-50
                  ${
                    errorMsg
                      ? "border-red-700 focus:border-red-500"
                      : "border-neutral-700 focus:border-neutral-500"
                  }
                `}
                aria-invalid={!!errorMsg}
                aria-describedby={errorMsg ? "newsletter-error" : undefined}
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading" || !email}
              className="
                px-6 py-3 rounded-lg text-sm font-medium tracking-wide
                bg-neutral-100 text-neutral-900
                hover:bg-white
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200
                flex items-center justify-center gap-2
                min-w-[110px]
              "
            >
              {status === "loading" ? (
                <>
                  <svg
                    className="animate-spin"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                  </svg>
                  <span>Mendaftar</span>
                </>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>

          {/* Error message */}
          {errorMsg && (
            <p
              id="newsletter-error"
              role="alert"
              className="mt-2 text-xs text-red-400"
            >
              {errorMsg}
            </p>
          )}

          {/* General error */}
          {status === "error" && !errorMsg && (
            <p
              role="alert"
              className="mt-2 text-xs text-red-400 text-center"
            >
              Terjadi kesalahan. Coba lagi nanti.
            </p>
          )}

          <p className="text-neutral-700 text-xs text-center mt-3">
            Tidak ada spam. Unsubscribe kapan saja.
          </p>
        </form>
      )}
    </div>
  );
}