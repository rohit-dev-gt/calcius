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
        // Base palette
        navy: {
          950: '#060912',
          900: '#0B0F1A',
          800: '#141926',
          700: '#1E2535',
          600: '#2A3347',
        },
        // Module accent colors
        module: {
          arithmetic:    '#F97316',
          squares:       '#8B5CF6',
          cubes:         '#14B8A6',
          tables:        '#3B82F6',
          percentages:   '#22C55E',
          fractions:     '#EC4899',
          hcflcm:        '#F59E0B',
          powers:        '#EF4444',
          series:        '#06B6D4',
          bodmas:        '#84CC16',
          averages:      '#F43F5E',
          vedic:         '#EAB308',
          approximation: '#7C3AED',
          mock:          '#F8FAFC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'question': ['3.25rem', { lineHeight: '1.1', fontWeight: '700' }],
        'question-sm': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
      },
      animation: {
        'pulse-timer': 'pulse-timer 1s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s infinite',
        'rank-up': 'rank-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'pulse-timer': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(0.97)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'rank-up': {
          '0%': { opacity: '0', transform: 'scale(0.5) rotate(-10deg)' },
          '60%': { transform: 'scale(1.15) rotate(3deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.3)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-teal': '0 0 20px rgba(20, 184, 166, 0.3)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}
