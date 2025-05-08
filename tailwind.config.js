/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'navy': '#1A305E',
        'gold': '#B8860B',
        'light-blue': 'rgba(70, 130, 180, 0.5)'
      },
      fontFamily: {
        'sans': ['Montserrat', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
} 