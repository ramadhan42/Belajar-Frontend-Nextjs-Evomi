import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // <--- WAJIB ADA INI
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // <--- Pastikan semua folder masuk
  ],
  theme: {
    extend: {
      fontFamily: {
        brand: ["var(--font-brand)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
