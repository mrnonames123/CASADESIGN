/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'casa-charcoal': '#121212',
        'casa-cream': '#F5F5F7',
        'casa-bronze': '#A68A64'
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif']
      },
      keyframes: {
        'music-wave': {
          '0%, 100%': { height: '2px' },
          '50%': { height: '12px' }
        }
      },
      animation: {
        'music-wave': 'music-wave 1s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
