/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      colors: {
        primary: {
          light: '#9E83B8',
          DEFAULT: '#9E83B8',
          dark: '#C6A7E3',
        },
        secondary: {
          light: '#CCBBDB',
          DEFAULT: '#CCBBDB',
          dark: '#998BB2',
        },
        background: {
          light: '#EBE5D9',
          DEFAULT: '#EBE5D9',
          dark: '#1E1A22',
        },
      },
    },
  },
  plugins: [],
};