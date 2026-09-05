/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sports: ['Oswald', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        panda: {
          50: '#fef2f2',
          100: '#ffe1e1',
          200: '#ffc8c9',
          300: '#fda4a6',
          400: '#f87174',
          500: '#e54547',
          600: '#d33638', // Exact Logo Crimson Red
          700: '#b42628',
          800: '#942022',
          900: '#7a1d1f',
          950: '#430b0c',
        },
        brand: {
          red: '#d33638',
          redDark: '#b42628',
          redLight: '#fef2f2',
          dark: '#09090b',
          card: '#18181b',
        }
      }
    },
  },
  plugins: [],
}
