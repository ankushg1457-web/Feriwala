/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#fef7ee', 100: '#feecdc', 200: '#fcd6b5', 300: '#fab97e', 400: '#f79345', 500: '#f47721', 600: '#e55d13', 700: '#be4611', 800: '#973816', 900: '#7a3015' },
        feriwala: { orange: '#f47721', dark: '#1a1a2e', blue: '#162447' },
      },
    },
  },
  plugins: [],
};
