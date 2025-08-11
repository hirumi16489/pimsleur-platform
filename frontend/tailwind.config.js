/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 600: '#4f46e5', 700: '#4338ca' },
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(0,0,0,0.06)',
      },
      spacing: {
        4: '1rem',
        6: '1.5rem',
        8: '2rem',
        12: '3rem',
        16: '4rem',
        24: '6rem',
      },
    },
  },
  plugins: [],
};
