/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        electric: "#2563eb",
        "electric-dark": "#1d4ed8",
        sky: "#38bdf8",
        "sky-soft": "#e0f2fe",
        dark: "#0f172a"
      },
      boxShadow: {
        neo: "4px 4px 0px #0f172a",
        "neo-sm": "2.5px 2.5px 0px #0f172a",
        "neo-lg": "6px 6px 0px #0f172a",
        "neo-xl": "8px 8px 0px #0f172a"
      },
      borderRadius: {
        squircle: "22px"
      }
    }
  },
  plugins: []
};
