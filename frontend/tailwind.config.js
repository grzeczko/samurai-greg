/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
     animation: {
       'bounce-in': 'bounceIn 0.6s ease-out',
     },
     keyframes: {
       bounceIn: {
         '0%': { opacity: '0', transform: 'scale(0.3) translate(100px, 0)' },
         '50%': { opacity: '1' },
         '100%': { opacity: '1', transform: 'scale(1) translate(0, 0)' },
       },
     },
  },
  plugins: [],
}
