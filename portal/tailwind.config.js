/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe6ff",
          200: "#b8ccff",
          300: "#8aa9ff",
          400: "#5c7fff",
          500: "#3457f7",
          600: "#233ed6",
          700: "#1c2fa8",
          800: "#182878",
          900: "#0f1a4d",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
