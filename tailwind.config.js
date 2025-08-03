/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ifdd: {
          // Couleurs principales extraites du logo
          vert: {
            DEFAULT: '#85c441',
            light: '#add476',
            dark: '#6f2c91'
          },
          bleu: {
            DEFAULT: '#00aeef',
            light: '#8cd5f2',
            dark: '#3cc4f1'
          },
          rouge: {
            DEFAULT: '#ee3433',
            light: '#f28385'
          },
          violet: {
            DEFAULT: '#906cad',
            dark: '#6f2c91'
          },
          jaune: {
            DEFAULT: '#ffd400',
            light: '#fff08c'
          },
          gris: {
            DEFAULT: '#4e4c4d',
            light: '#6e6f71',
            dark: '#353635'
          }
        }
      },
      fontFamily: {
        'helvetica': ['Helvetica Neue', 'Arial', 'sans-serif'],
        'maverick': ['Maverick', 'sans-serif']
      }
    },
  },
  plugins: [],
}
