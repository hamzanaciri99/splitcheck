/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset'), require('../../packages/ui/tailwind-preset.js')],
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
};
