/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      ...colors,
      primary: '#71c9ff',
      secondary: '#8e2385',
      accent: '#ffd700',
      neutral: {
        100: '#ffffff', // White
        200: '#b6b6b6', // Light Gray
        300: '#656565', // Dark Gray
        400: '#000000', // Black
      },
      backgroundColor: '#181818',
    },
    extend: {},
  },
  plugins: [],
};
