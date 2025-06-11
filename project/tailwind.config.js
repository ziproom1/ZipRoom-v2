/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cyber-blue': '#00D9FF',
        'cyber-purple': '#9D4EDD',
        'cyber-pink': '#FF006E',
        'cyber-green': '#39FF14',
        'cyber-dark': '#0A0A0F',
        'cyber-darker': '#050507',
        'cyber-gray': '#1A1A1F',
      },
      fontFamily: {
        'cyber': ['Orbitron', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'glitch': 'glitch 0.3s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          'from': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.5)' },
          'to': { boxShadow: '0 0 30px rgba(0, 217, 255, 0.8), 0 0 40px rgba(157, 78, 221, 0.3)' }
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' }
        },
        'fade-in': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-up': {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #0A0A0F 0%, #1A1A1F 50%, #0A0A0F 100%)',
        'neon-gradient': 'linear-gradient(90deg, #00D9FF 0%, #9D4EDD 50%, #FF006E 100%)',
      }
    },
  },
  plugins: [],
};