/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#F59E0B',
          DEFAULT: '#D4AF37',
          dark: '#B45309',
        },
        darkbg: {
          DEFAULT: '#0B0F19',
          card: '#111827',
          hover: '#1F2937',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
