/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0a0d14',
          card: '#121824',
          border: '#1f293d',
          gold: '#f59e0b',
          cyan: '#06b6d4',
          purple: '#8b5cf6',
          pink: '#ec4899',
          danger: '#ef4444',
          success: '#10b981'
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 0.8s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)' },
          '100%': { boxShadow: '0 0 35px rgba(245, 158, 11, 0.8)' }
        }
      }
    },
  },
  plugins: [],
}
