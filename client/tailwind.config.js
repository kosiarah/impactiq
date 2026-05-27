/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        slate: {
          950: '#0a0f1e',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        amber: {
          400: '#fbbf24',
        },
        rose: {
          400: '#fb7185',
        }
      }
    },
  },
  plugins: [],
}
