module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["\"M PLUS Rounded 1c\"", "sans-serif"],
        body: ["\"Sora\"", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 30px rgba(255, 107, 107, 0.35)",
      },
    },
  },
  plugins: [],
};
