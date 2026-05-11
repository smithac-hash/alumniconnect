/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#fde68a', // beige/gold light
          DEFAULT: '#d4a373', // earthy gold
          dark: '#a98467',
        },
        accent: {
          light: '#60a5fa',
          DEFAULT: '#3b82f6',
          dark: '#1e40af',
        }
      }
    },
  },
  plugins: [],
}
