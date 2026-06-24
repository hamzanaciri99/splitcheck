/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('../../packages/ui/tailwind-preset.js')],
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        'inter-medium': ['Inter', 'sans-serif'],
        'inter-semibold': ['Inter', 'sans-serif'],
        'inter-bold': ['Inter', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        'jakarta-bold': ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
};
