/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  theme: {
    extend: { 
      boxShadow: {
        custom: "0px 4px 24px 0px rgba(228, 228, 228, 0.25)",
      },
      colors: {
        "twmprimary": '#0052CC', 
      },
      backgroundImage: {
        "blue-gradient":
          "linear-gradient(107.87deg, #5F00D9 0.94%, #9E00FF 98%)",
        "red-gradient":
          "linear-gradient(240deg, #FF740F 3%, #bf407af5 56%, #7000FF 94%)",
        "blue-2-gradient":
          " linear-gradient(234.75deg, #2D5BFF 39.7%, #EA23EE 81.13%)",
        "black-gradient":
          "radial-gradient(60.38% 164.72% at 13.57% 5.25%, #474D5A 0%, #030F27 100%)",
        "gold-gradient":
          "linear-gradient(107.87deg, #FFA41C 0.94%, #FAFF09 98%)",
        "button-gradient":
          "linear-gradient(180deg, #3063E4 0%, #7952ED 163.46%)",
        "table-graidient":
          "linear-gradient(180deg, #683FEA 0%, rgba(87, 3, 154, 0.97) 100%)",
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
        }
      },
      animation: {
        shake: 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both'
      }
    },
  },
  plugins: [],
};