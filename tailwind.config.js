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
        'cairo': ['Cairo', 'sans-serif'],
        'noto-naskh': ['Noto Naskh Arabic', 'serif'],
        'amiri': ['Amiri', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1A535C', // Dark Teal
          light: '#2E8A8F',
          dark: '#0F3A40',
        },
        secondary: {
          DEFAULT: '#FFD700', // Gold-ish
          light: '#FFEB87',
          dark: '#B29600',
        },
        background: {
          light: '#F7F9F9',
          dark: '#1E232A', // Darker gray for better contrast
        },
        text: {
          light: '#2C3E50',
          dark: '#E0E0E0',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#2A3038',
        }
      }
    },
  },
  plugins: [],
}
