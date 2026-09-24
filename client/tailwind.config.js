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
          DEFAULT: '#0f4c81', // Trust blue
          light: '#2a69ac',
          dark: '#0a365c',
        },
        secondary: {
          DEFAULT: '#10b981', // Emerald green
          light: '#34d399',
          dark: '#059669',
        },
        surface: '#f8fafc', // Soft off-white for backgrounds
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
