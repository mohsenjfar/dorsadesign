// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#e6d0cb',
          300: '#d9b9b2',
          400: '#cda198',
          500: '#c08a7f',
          600: '#b37266',
          700: '#a65b4d',
          800: '#9a4334',
          900: '#8d2c1b',
        },
        dark: {
          100: '#1a1a1a',
          200: '#2d2d2d',
          300: '#404040',
          400: '#555555',
          500: '#6b6b6b',
        }
      },
    },
  },
  plugins: [],
}