/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3f51b5",
        secondary: "#f50057",
        success: "#4caf50",
        warning: "#ff9800",
        danger: "#f44336",
        "gray-light": "#f8f9fa",
        "gray-medium": "#e9ecef",
      },
    },
  },
  plugins: [],
};
