/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        elana: {
          rosa: '#E66795',
          coral: '#FF7F5B',
          ouro: '#FFD166',
          verde: '#8A9A5B',
          terracota: '#B87353',
          petroleo: '#003B46',
          dark: '#080E10',
          card: '#101B1E',
          surface: '#18272B',
          hover: '#223439',
        }
      },
      fontFamily: {
        heading: ['Saira Condensed', 'sans-serif'],
        body: ['PT Sans', 'sans-serif'],
        ui: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    },
  ],
}
