/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/shared/src/**/*.{js,ts,jsx,tsx}",
    "../../src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#060d19',
          900: '#0b172a',
          850: '#0f2038',
          800: '#142947',
          700: '#1e385c',
          600: '#2c4e7a',
          500: '#3a679e',
          400: '#5286c3',
          300: '#7bb0e3',
          200: '#b4d5f5',
          100: '#e2effb',
        },
        sea: {
          accent: '#00e5ff',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          purple: '#a855f7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
