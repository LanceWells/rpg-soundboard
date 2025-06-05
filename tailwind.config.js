import typography from '@tailwindcss/typography'
import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/src/**/*.{js,ts,tsx,jsx}', './src/renderer/index.html'],
  theme: {},
  plugins: [typography, daisyui]
}
