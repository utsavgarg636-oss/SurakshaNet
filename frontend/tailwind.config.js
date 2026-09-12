/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        safe: {
          light: '#34d399',
          DEFAULT: '#10b981',
          dark: '#059669',
          glow: 'rgba(16, 185, 129, 0.4)'
        },
        danger: {
          light: '#f87171',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
          glow: 'rgba(239, 68, 68, 0.4)'
        },
        warning: {
          light: '#fbbf24',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
          glow: 'rgba(245, 158, 11, 0.4)'
        },
        cyber: {
          dark: '#090d16',
          card: 'rgba(15, 23, 42, 0.75)',
          border: 'rgba(51, 65, 85, 0.6)',
          accent: '#38bdf8'
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Outfit"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-crimson': 'glowCrimson 2s ease-in-out infinite alternate',
        'glow-emerald': 'glowEmerald 2s ease-in-out infinite alternate',
        'ripple': 'rippleEffect 2s cubic-bezier(0, 0.2, 0.8, 1) infinite',
        'wave-bar': 'waveBar 1s ease-in-out infinite alternate'
      },
      keyframes: {
        glowCrimson: {
          '0%': { boxShadow: '0 0 15px rgba(239, 68, 68, 0.3), inset 0 0 15px rgba(239, 68, 68, 0.2)' },
          '100%': { boxShadow: '0 0 35px rgba(239, 68, 68, 0.8), inset 0 0 25px rgba(239, 68, 68, 0.4)' }
        },
        glowEmerald: {
          '0%': { boxShadow: '0 0 15px rgba(16, 185, 129, 0.3), inset 0 0 15px rgba(16, 185, 129, 0.2)' },
          '100%': { boxShadow: '0 0 35px rgba(16, 185, 129, 0.7), inset 0 0 25px rgba(16, 185, 129, 0.4)' }
        },
        rippleEffect: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '100%': { transform: 'scale(1.7)', opacity: '0' }
        },
        waveBar: {
          '0%': { height: '8px' },
          '100%': { height: '36px' }
        }
      }
    },
  },
  plugins: [],
}
