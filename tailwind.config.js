import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(-5px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in",
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        ".fade-in": {
          animation: "fadeIn 0.3s ease-in",
        },
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
          "scrollbar-color": "rgba(255, 255, 255, 0.2) transparent",
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            "background-color": "rgba(255, 255, 255, 0.2)",
            "border-radius": "3px",
            border: "2px solid transparent",
            "background-clip": "content-box",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            "background-color": "rgba(255, 255, 255, 0.4)",
            "background-clip": "content-box",
          },
        },
      });
    }),
  ],
};
