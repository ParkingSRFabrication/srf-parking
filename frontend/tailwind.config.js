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
        arattai: {
          50: '#E6F7F3',
          100: '#C1EFE4',
          200: '#86DFCA',
          300: '#4DCEB0',
          400: '#1FBD97',
          500: '#00A884',
          600: '#008F6F',
          700: '#00755B',
          800: '#005C47',
          900: '#004737',
          DEFAULT: '#00A884'
        },
        brand: {
          navy: '#0F172A',
          deep: '#090D16',
          surface: '#111827',
          card: '#1E293B',
          blue: '#3B82F6',
          indigo: '#6366F1',
          accent: '#00A884',
          border: '#334155',
          glow: '#00A884'
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#06B6D4'
        }
      },
      fontFamily: {
        outfit: ['Outfit', '-apple-system', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(0, 168, 132, 0.4)',
        glowEmerald: '0 0 25px -5px rgba(0, 168, 132, 0.4)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
        card: '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)'
      }
    },
  },
  plugins: [],
}
