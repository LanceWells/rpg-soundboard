import typography from '@tailwindcss/typography'
import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/src/**/*.{js,ts,tsx,jsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      keyframes: {
        radialspin: {
          '0%, 100%': {
            backgroundPosition: 'top left',
            backgroundSize: '200% 200%'
          },
          '25%': {
            backgroundPosition: 'top right'
          },
          '50%': {
            backgroundPosition: 'bottom right'
          },
          '75%': {
            backgroundPosition: 'bottom left'
          }
        }
      },
      animation: {
        radialspin: 'radialspin 2s linear infinite'
      }
    }
  },
  plugins: [typography, daisyui]
}
