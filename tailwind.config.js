/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // Enable class-based dark mode
    content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
    theme: {
      extend: {
        colors: {
          primary: '#86efac',
          zinc: {
            900: '#18181b', // Darkest zinc
            800: '#27272a',
            700: '#3f3f46',
          },
        },
      },
    },
    plugins: [],
  };
  