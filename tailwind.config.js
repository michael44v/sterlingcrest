/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chase: {
          blue: '#117ACA',
          navy: '#0A2D5A',
          light: '#E8F4FC',
          mid: '#1A6BB5',
          border: '#C8DCF0',
        },
      },
    },
  },
  plugins: [],
}
