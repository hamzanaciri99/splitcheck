/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: '#0D0D0F',
        surface: '#1A1A1D',
        'surface-alt': '#232327',
        border: '#2A2A2E',
        accent: '#A8E8D6',
        'accent-foreground': '#0D0D0F',
        positive: '#9FE6C9',
        negative: '#F0A9A3',
        'text-primary': '#F5F5F5',
        'text-secondary': '#9A9AA0',
        'text-muted': '#6E6E73',
      },
      borderRadius: {
        xl: '20px',
        '2xl': '28px',
      },
    },
  },
  plugins: [],
};
