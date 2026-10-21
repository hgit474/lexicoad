/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        laxBlue: {
          50: '#eef6f8',
          100: '#d9e9ed',
          200: '#b6d1d8',
          600: '#0d6078',
          700: '#0a4d61',
          800: '#073e58',
          900: '#052f42',
          950: '#031d2a'
        },
        laxRed: {
          50: '#fff4f3',
          100: '#f9dfdc',
          500: '#a31616',
          600: '#8e0808',
          700: '#700606',
          900: '#450404'
        },
        laxNavy: '#052f42'
      },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        grotesk: ['"Space Grotesk"', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      },
      boxShadow: {
        card: '0 20px 60px -15px rgba(5,47,66,.25)',
        glowB: '0 0 40px rgba(13,96,120,.45)',
        glowR: '0 0 40px rgba(142,8,8,.45)'
      }
    },
  },
  plugins: [],
}
